export const delay = (time: number) => {
  console.log('delay', time)
  return new Promise((resolve) => setTimeout(resolve, time))
}
