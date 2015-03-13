function formatPathToString(path) {
  return `State(${ path.map((fragment) => fragment.toString()).join(' -> ') })`;
}

export default formatPathToString;
