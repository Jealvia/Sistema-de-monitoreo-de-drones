export default class BaseRequest {
  private data: any;
  private id: any;
  constructor(data: any, id?: any) {
    this.data = data;
    this.id = id;
  }

  update() {
    return {
      query: {
        _id: this.id,
      },
      payload: {
        ...this.data,
      },
    };
  }

  save() {
    return this.data;
  }
}
