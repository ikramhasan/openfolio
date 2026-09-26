import { resumeResponse } from "../resume";

export async function GET() {
  return resumeResponse("attachment");
}
