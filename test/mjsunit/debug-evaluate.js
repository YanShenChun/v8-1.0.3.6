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

// Flags: --expose-debug-as debug
// Get the Debug object exposed from the debug context global object.
Debug = debug.Debug

listenerComplete = false;
exception = false;

// The base part of all evaluate requests.
var base_request = '"seq":0,"type":"request","command":"evaluate"'

function safeEval(code) {
  try {
    return eval('(' + code + ')');
  } catch (e) {
    assertEquals(void 0, e);
    return undefined;
  }
}

function testRequest(dcp, arguments, success, result) {
  // Generate request with the supplied arguments.
  var request;
  if (arguments) {
    request = '{' + base_request + ',"arguments":' + arguments + '}';
  } else {
    request = '{' + base_request + '}'
  }
  var response = safeEval(dcp.processDebugJSONRequest(request));
  if (success) {
    assertTrue(response.success, request + ' -> ' + response.message);
    assertEquals(result, response.body.value);
  } else {
    assertFalse(response.success, request + ' -> ' + response.message);
  }
  assertFalse(response.running, request + ' -> expected not running');
}

function listener(event, exec_state, event_data, data) {
  try {
  if (event == Debug.DebugEvent.Break) {
    // Get the debug command processor.
    var dcp = exec_state.debugCommandProcessor();

    // Test some illegal evaluate requests.
    testRequest(dcp, void 0, false);
    testRequest(dcp, '{"expression":"1","global"=true}', false);
    testRequest(dcp, '{"expression":"a","frame":4}', false);

    // Test some legal evaluate requests.
    testRequest(dcp, '{"expression":"1+2"}', true, 3);
    testRequest(dcp, '{"expression":"a+2"}', true, 5);
    testRequest(dcp, '{"expression":"({\\"a\\":1,\\"b\\":2}).b+2"}', true, 4);

    // Test evaluation of a in the stack frames and the global context.
    testRequest(dcp, '{"expression":"a"}', true, 3);
    testRequest(dcp, '{"expression":"a","frame":0}', true, 3);
    testRequest(dcp, '{"expression":"a","frame":1}', true, 2);
    testRequest(dcp, '{"expression":"a","frame":2}', true, 1);
    testRequest(dcp, '{"expression":"a","global":true}', true, 1);
    testRequest(dcp, '{"expression":"this.a","global":true}', true, 1);

    // Indicate that all was processed.
    listenerComplete = true;
  }
  } catch (e) {
    exception = e
  };
};

// Add the debug event listener.
Debug.setListener(listener);

function f() {
  var a = 3;
};

function g() {
  var a = 2;
  f();
};

a = 1;

// Set a break point at return in f and invoke g to hit the breakpoint.
Debug.setBreakPoint(f, 2, 0);
g();

// Make sure that the debug event listener vas invoked.
assertTrue(listenerComplete, "listener did not run to completion");
assertFalse(exception, "exception in listener")
