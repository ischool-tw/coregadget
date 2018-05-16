export class Utils {

  static value(obj, path) {

    if (!path) { return; }

    let current = obj;
    for (const p of path.split('/')) {
      current = current[p];

      if (!current) {
        current = undefined;
        break;
      }
    }

    return current;
  }

  static array(obj, path) {
    if (path) {
      return [].concat(Utils.value(obj, path) || []);
    } else {
      return [].concat(obj || []);
    }
  }
}
