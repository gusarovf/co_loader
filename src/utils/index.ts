import fetch from "node-fetch"

export const msToTimeString = (msecs: number): string => {
  const ms = ((msecs % 1000) / 100).toFixed(0).padStart(2, "0")
  const secs = ((msecs / 1000) % 60).toFixed(0).padStart(2, "0")
  const mins = ((msecs / (1000 * 60)) % 60).toFixed(0).padStart(2, "0")
  const hrs = ((msecs / (1000 * 60 * 60)) % 24).toFixed(0).padStart(2, "0")

  return `${hrs}:${mins}:${secs}:${ms} - (${msecs.toFixed(6)} ms)`
}

export const hoursToMs = (hoursCount: number | string): number | undefined => {
  if (!hoursCount) return
  const hours =
    typeof hoursCount === "number" ? hoursCount : parseInt(hoursCount)
  if (!isNaN(hours)) return hours * 60 * 60 * 1000

  return
}

export const isFullUrl = (url: string): boolean => {
  const regex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi

  return regex.test(url)
}

export const fetchUrl = (url: string): Promise<Buffer> =>
  fetch(url).then((res) => res.buffer())
