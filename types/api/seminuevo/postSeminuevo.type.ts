import CommonRequest from "../../commonRequest.type";

export default interface PostSeminuevo extends CommonRequest<{ price: number; description: string }> {}
