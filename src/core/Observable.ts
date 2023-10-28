export type ListenerArgs<EventType, EventData> = { data: EventData; event: EventType }
export type Listener<EventType, EventData> = (e: ListenerArgs<EventType, EventData>) => void

export class Observable<EventType extends string, EventDataTypes extends Record<EventType, any>> {
  private listeners = new Map<EventType, Listener<any, any>[]>()
  private globalListeners: Listener<EventType, EventDataTypes[EventType]>[] = []

  async wait<T extends EventType>(event: T): Promise<ListenerArgs<T, EventDataTypes[T]>> {
    return new Promise((resolve) => this.once(event, resolve))
  }

  async race(events: EventType[]) {
    return await Promise.race(events.map((event) => this.wait(event)))
  }

  once<T extends EventType>(event: T, listener: Listener<T, EventDataTypes[T]>) {
    const listenerWithRemove = (e: ListenerArgs<T, EventDataTypes[T]>) => {
      listener(e)
      this.off(event, listenerWithRemove)
    }
    this.on(event, listenerWithRemove)
  }

  on<T extends EventType>(event: T, listener: Listener<T, EventDataTypes[T]>): () => void {
    const listeners = this.listeners.get(event) ?? []
    listeners.push(listener)
    this.listeners.set(event, listeners)
    return () => this.off(event, listener)
  }

  off<T extends EventType>(event: T, listener: Listener<T, EventDataTypes[T]>): void {
    const listeners = this.listeners.get(event) ?? []
    listeners.splice(listeners.indexOf(listener), 1)
  }

  addListener(listener: Listener<EventType, EventDataTypes[EventType]>): () => void {
    this.globalListeners.push(listener)
    return () => this.removeListener(listener)
  }

  removeListener(listener: Listener<EventType, EventDataTypes[EventType]>): void {
    this.globalListeners.splice(this.globalListeners.indexOf(listener), 1)
  }

  protected trigger<T extends EventType>(event: T, data: EventDataTypes[T]): void {
    this.listeners.get(event)?.forEach((listener) => listener({ event, data }))
    this.globalListeners.forEach((listener) => listener({ event, data }))
  }
}
