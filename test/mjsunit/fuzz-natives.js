// Copyright 2008 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Flags: --allow-natives-syntax

function makeArguments() {
  var result = [ ];
  result.push(17);
  result.push(-31);
  result.push(Number.MAX_VALUE);
  result.push(new Array(5003));
  result.push(Number.MIN_VALUE);
  result.push("whoops");
  result.push("x");
  result.push({"x": 1, "y": 2});
  var slowCaseObj = {"a": 3, "b": 4, "c": 5};
  delete slowCaseObj.c;
  result.push(slowCaseObj);
  result.push(function () { return 8; });
  return result;
}

var kArgObjects = makeArguments().length;

function makeFunction(name, argc) {
  var args = [];
  for (var i = 0; i < argc; i++)
    args.push("x" + i);
  var argsStr = args.join(", ");
  return new Function(args.join(", "), "return %" + name + "(" + argsStr + ");");
}

function testArgumentCount(name) {
  for (var i = 0; i < 10; i++) {
    var func = makeFunction(name, i);
    var args = [ ];
    for (var j = 0; j < i; j++)
      args.push(0);
    try {
      func.apply(void 0, args);
    } catch (e) {
      // we don't care what happens as long as we don't crash
    }
  }
}

function testArgumentTypes(name, argc) {
  var type = 0;
  var hasMore = true;
  var func = makeFunction(name, argc);
  while (hasMore) {
    var argPool = makeArguments();
    var current = type;
    var hasMore = false;
    var argList = [ ];
    for (var i = 0; i < argc; i++) {
      var index = current % kArgObjects;
      current = (current / kArgObjects) << 0;
      if (index != (kArgObjects - 1))
        hasMore = true;
      argList.push(argPool[index]);
    }
    try {
      func.apply(void 0, argList);
    } catch (e) {
      // we don't care what happens as long as we don't crash
    }
    type++;
  }
}

var knownProblems = {
  "Abort": true,
  
  // These functions use pseudo-stack-pointers and are not robust
  // to unexpected integer values.
  "DebugEvaluate": true,

  // These functions do nontrivial error checking in recursive calls,
  // which means that we have to propagate errors back.
  "SetFunctionBreakPoint": true,
  "SetScriptBreakPoint": true,
  "ChangeBreakOnException": true,
  "PrepareStep": true,

  // Too slow.
  "DebugReferencedBy": true,

  // Calling disable/enable access checks may interfere with the
  // the rest of the tests.
  "DisableAccessChecks": true,
  "EnableAccessChecks": true,
  
  // These functions should not be callable as runtime functions.
  "NewContext": true,
  "NewArgumentsFast": true,
  "PushContext": true,
  "LazyCompile": true,
  "CreateObjectLiteralBoilerplate": true,
  "CloneObjectLiteralBoilerplate": true,
  "IS_VAR": true,
  "ResolvePossiblyDirectEval": true,
  "Log": true
};

var currentlyUncallable = {
  // We need to find a way to test this without breaking the system.
  "SystemBreak": true
};

function testNatives() {
  var allNatives = %ListNatives();
  for (var i = 0; i < allNatives.length; i++) {
    var nativeInfo = allNatives[i];
    var name = nativeInfo[0];
    if (name in knownProblems || name in currentlyUncallable)
      continue;
    print(name);
    var argc = nativeInfo[1];
    testArgumentCount(name);
    testArgumentTypes(name, argc);
  }
}

testNatives();
