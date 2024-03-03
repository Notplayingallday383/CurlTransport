import { BareHeaders, BareResponse, TransferrableResponse, type BareTransport } from "@mercuryworkshop/bare-mux";
import { libcurl } from "libcurl.js";
export class LibcurlClient implements BareTransport {
  wisp: string;

  constructor({ wisp }) {
    this.wisp = wisp;
    libcurl.load_wasm("libcurl.wasm");
    libcurl.set_websocket(wisp);
  }
  async init() {
    this.ready = true;
  }
  ready = true;
  async meta() { }

  async request(
    remote: URL,
    method: string,
    body: BodyInit | null,
    headers: BareHeaders,
    signal: AbortSignal | undefined
  ): Promise<TransferrableResponse> {
    let payload = await libcurl.fetch(remote.href, {
      method,
      headers: headers,
      body,
      redirect: "manual",
    })

    let respheaders = {};

    for (const [key, value] of [...payload.headers]) {
      respheaders[key] = value;
    }


    return {
      body: payload.body!,
      headers: respheaders,
      status: payload.status,
      statusText: payload.statusText,
    }
  }

  connect(
    url: URL,
    origin: string,
    protocols: string[],
    requestHeaders: BareHeaders,
    onopen: (protocol: string) => void,
    onmessage: (data: Blob | ArrayBuffer | string) => void,
    onclose: (code: number, reason: string) => void,
    onerror: (error: string) => void,
  ): (data: Blob | ArrayBuffer | string) => void {
    let socket = new libcurl.WebSocket(url.toString(), protocols);

    socket.onopen = onopen;
    socket.onclose = onclose;
    socket.onerror = onerror;

    socket.onmessage = (event) => {
      console.log(event);
    }

    // ws.close = () => {
    //       socket.close();
    //     }
    return (data) => {
      socket.send(data);
    }
  }
}
