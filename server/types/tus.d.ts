declare module "@tus/server" {
  interface ServerOptions {
    path: string;
    datastore?: any; // 데이터스토어 옵션을 any로 정의하여 타입 오류 해결
    respectForwardedHeaders?: boolean;
    namingFunction?: (req: any) => string;
    onUploadFinish?: (req: any, res: any, upload: any) => any;
  }

  class Server {
    constructor(options: ServerOptions);
    handle(req: any, res: any): void;
  }
}
