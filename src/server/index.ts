import http from "http"

const port = 5000
const srv = http.createServer((req, res) => {
  const userAgent = req.headers["user-agent"]
  if (typeof userAgent === "string" && userAgent.startsWith("kube-probe/")) {
    res.writeHead(200)
    res.end()
    return
  }
  res.writeHead(404)
  res.end()
})

export const startKubeServer = () => {
  srv.listen(port)
  console.log("Kube answer server started.")
}


