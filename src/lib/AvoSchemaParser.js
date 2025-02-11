const isArray = (obj) => {
  return Object.prototype.toString.call(obj) === "[object Array]";
};

class AvoSchemaParser {
  static extractSchema(eventProperties) {
    if (eventProperties === null || eventProperties === undefined) {
      return [];
    }

    const mapping = (object) => {
      if (isArray(object)) {
        const list = object.map((x) => {
          return mapping(x);
        });
        return this.removeDuplicates(list);
      } else if (typeof object === "object") {
        const mappedResult = [];
        for (const key in object) {
          if (object.hasOwnProperty(key)) {
            const val = object[key];

            const mappedEntry = {
              propertyName: key,
              propertyType: this.getPropValueType(val),
            };

            if (typeof val === "object" && val != null) {
              mappedEntry.children = mapping(val);
            }

            mappedResult.push(mappedEntry);
          }
        }

        return mappedResult;
      } else {
        return this.getPropValueType(object);
      }
    };

    const mappedEventProps = mapping(eventProperties);

    return mappedEventProps;
  }

  static removeDuplicates(array) {
    const primitives = { boolean: {}, number: {}, string: {} };
    const objects = [];

    return array.filter((item) => {
      const type = typeof item;
      if (type in primitives) {
        if (primitives[type].hasOwnProperty(item)) {
          return false;
        } else {
          primitives[type][item] = true;
          return true;
        }
      } else {
        if (objects.includes(item)) {
          return false;
        } else {
          objects.push(item);
          return true;
        }
      }
    });
  }

  static getPropValueType(propValue) {
    const propType = typeof propValue;
    if (propValue == null) {
      return "null";
    } else if (propType === "string") {
      return "string";
    } else if (propType === "number" || propType === "bigint") {
      if ((propValue + "").includes(".")) {
        return "float";
      } else {
        return "int";
      }
    } else if (propType === "boolean") {
      return "boolean";
    } else if (propType === "object") {
      if (isArray(propValue)) {
        return "list";
      } else {
        return "object";
      }
    } else {
      return "unknown";
    }
  }
}

module.exports = AvoSchemaParser;
