const isValueEmpty = (value) => {
  return value === null || value === undefined || value.trim().length === 0;
};

function deepEquals(x, y) {
  if (x === y) {
    return true;
  }

  if (!(x instanceof Object) || !(y instanceof Object)) {
    return false;
  }

  if (x.constructor !== y.constructor) {
    return false;
  }

  for (let p in x) {
    if (!x.hasOwnProperty(p)) {
      continue;
    }

    if (!y.hasOwnProperty(p)) {
      return false;
    }

    if (x[p] === y[p]) {
      continue;
    }

    if (typeof x[p] !== "object") {
      return false;
    }

    if (!deepEquals(x[p], y[p])) {
      return false;
    }
  }

  for (let p in y) {
    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
      return false;
    }
  }

  return true;
}

module.exports = { isValueEmpty, deepEquals };
