var runtime = require("./runtime.js");

// super when returnType is id and args are void
// id objc_msgSendSuper(struct objc_super *super, SEL op, void)

var SuperInit = runtime.SuperCall(NSStringFromSelector("init"), [], { type: "@" });

var reserved = {'className': 1, 'classname': 1, 'superclass': 1};

function getIvar(obj, name) {
  const retPtr = MOPointer.new();
  runtime.object_getInstanceVariable(obj, name, retPtr);
  return retPtr.value().retain().autorelease();
}

// Returns a real ObjC class. No need to use new.
function ObjCClass(defn) {
  var superclass = defn.superclass || NSObject;
  const className = (defn.className || defn.classname || "ObjCClass") + NSUUID.UUID().UUIDString();
  var cls = MOClassDescription.allocateDescriptionForClassWithName_superclass(className, superclass);
  // Add each handler to the class description
  var ivars = [];
  for (var key in defn) {
    var v = defn[key];
    if (typeof v == 'function' && key !== 'init') {
      var selector = NSSelectorFromString(key);
      cls.addInstanceMethodWithSelector_function(selector, v);
    } else if (!reserved[key]) {
      ivars.push(key);
      cls.addInstanceVariableWithName_typeEncoding(key, "@");
    }
  }

  cls.addInstanceMethodWithSelector_function(NSSelectorFromString('init'), function () {
    const self = SuperInit.call(this);
    ivars.map(function (name) {
      Object.defineProperty(self, name, {
        get() {
          return getIvar(self, name);
        },
        set(v) {
          runtime.object_setInstanceVariable(self, name, v);
        }
      });
      self[name] = defn[name];
    });
    // If there is a passsed-in init funciton, call it now.
    if (typeof defn.init == 'function') defn.init.call(this);
    return self;
  });

  return cls.registerClass();
}

module.exports = ObjCClass;
module.exports.SuperCall = runtime.SuperCall;
