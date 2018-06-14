var parseXml = parseXml || {};
parseXml.CreateParser = function () {

    var parser = {
        parse: function (obj, rootName) {
            rootName = rootName || "root";
            var writer = new XMLWriter("UTF-8", "1.0");
            writer.writeStartDocument();
            writer.writeStartElement(rootName);
            Transform(writer, [obj], obj);
            writer.writeEndElement();
            writer.writeEndDocument();
            return writer.flush();
        }
    };
    return parser;

    function Transform(writer, stack, obj) {
        var attribute = obj["@"] || "none";
        var attKeys = [];
        if (typeof attribute == 'string') {
            if (attribute.toLowerCase() === "auto")
                attribute = "auto";
            else
                attribute = "none";
        }
        else
            if (Array.isArray ? Array.isArray(attribute) : (attribute == null ? String(attribute) : Object.prototype.toString.call(attribute) == "[object Array]")) {  //if (attribute instanceof Array) {
                for (var i = 0; i < attribute.length; i++)
                    if (typeof attribute[i] == 'string')
                        attKeys.push(attribute[i]);
                attribute = "array";
            }
        for (var name in obj) {
            var value = obj[name];
            if ((typeof value) == "function" || name == "@")
                continue;
            if (name == '@text') {
                type = typeof obj[name];
                if (type == 'number' || type == 'string' || type == 'boolean') {
                    if (value == value.replace(/[\s]+/g, ' '))
                        writer.writeString(obj[name]);
                    else
                        writer.writeCDATA(obj[name]);
                }
                continue;
            }
            try {
                if (value != null) {
                    var type = typeof value;
                    if (type == 'number' || type == 'string' || type == 'boolean') {
                        var toAttribute = false;
                        if (attribute == "auto") {
                            toAttribute = true;
                        }
                        if (attribute == "array") {
                            for (var j = 0; j < attKeys.length; j++) {
                                if (attKeys[j].toLowerCase() === name.toLowerCase()) {
                                    toAttribute = true;
                                    break;
                                }
                            }
                        }
                        if (name.indexOf("@") == 0) {
                            toAttribute = true;
                        }
                        if (toAttribute) {
                            if (name.indexOf("@") == 0) {
                                writer.writeAttributeString(name.substr(1), value);
                            }
                            else {
                                writer.writeAttributeString(name, value);
                            }
                        }
                        else {
                            writer.writeStartElement(name);
                            if (type != 'string' || value == value.replace(/[\s]+/g, ' '))
                                writer.writeString(value);
                            else
                                writer.writeCDATA(value);
                            writer.writeEndElement();
                        }
                    }
                    else {
                        if (Array.isArray ? Array.isArray(value) : (value == null ? String(value) : (Object.prototype.toString.call(value) == "[object Array]"))) {//if ($.isArray(value)) {// (value instanceof Array) {
                            for (var k = 0; k < value.length; k++) {
                                type = typeof value[k];
                                writer.writeStartElement(name);
                                if (type == 'number' || type == 'string' || type == 'boolean') {
                                    if (type != 'string' || value[k] == value[k].replace(/\s/g, ' '))
                                        writer.writeString(value[k]);
                                    else
                                        writer.writeCDATA(value[k]);
                                }
                                else {
                                    var instack = false;
                                    for (var i = 0; i < stack.length; i++) {
                                        if (value[k] === arguments[i]) {
                                            instack = true;
                                            break;
                                        }
                                    }
                                    if (instack === true) {
                                        writer.WriteComment("循環參考");
                                    }
                                    else {
                                        stack.push(obj);
                                        Transform(writer, stack, value[k]);
                                        stack.pop();
                                    }
                                }
                                writer.writeEndElement();
                            }
                        }
                        else {
                            writer.writeStartElement(name);
                            var instack = false;
                            for (var i = 0; i < stack.length; i++) {
                                if (value === arguments[i]) {
                                    instack = true;
                                    break;
                                }
                            }
                            if (instack === true) {
                                writer.WriteComment("循環參考");
                            }
                            else {
                                stack.push(obj);
                                Transform(writer, stack, value);
                                stack.pop();
                            }
                            writer.writeEndElement();
                        }
                    }
                }
                else {
                    writer.writeStartElement(name);
                    writer.writeComment("此屬性值為「Null」。");
                    writer.writeEndElement();
                }
            }
            catch (ex) {
                writer.writeStartElement(name);
                writer.writeComment("讀取屬性值錯誤，訊息：\n" + ex);
                writer.writeEndElement();
            }
        }
    }
};
