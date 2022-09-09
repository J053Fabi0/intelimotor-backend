import CommonResponse from "../types/commonResponse.type";

export default function handleError(res: CommonResponse, err: any, code = 400) {
  if (process.env.NODE_ENV !== "test") console.log(err);
  res.status(code).send({ message: null, error: err?.message || err });
}
