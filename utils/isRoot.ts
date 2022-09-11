export default function isRoot() {
  // @ts-ignore
  return process.geteuid() === 0;
}
