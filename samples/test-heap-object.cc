// Copyright 2006-2008 the V8 project authors. All rights reserved.

#include <stdlib.h>

#include "v8.h"

#include "execution.h"
#include "factory.h"
#include "macro-assembler.h"
#include "global-handles.h"

#include <iostream>

using namespace v8::internal;

static v8::Persistent<v8::Context> env;

static void InitializeVM() {
  if (env.IsEmpty()) env = v8::Context::New();
  v8::HandleScope scope;
  env->Enter();
}

static void CheckOddball(Object* obj, const char* string) {
  CHECK(obj->IsOddball());
  bool exc;
  Object* print_string = *Execution::ToString(Handle<Object>(obj), &exc);
  CHECK(String::cast(print_string)->IsEqualTo(CStrVector(string)));
}


static void CheckSmi(int value, const char* string) {
  bool exc;
  Object* print_string =
      *Execution::ToString(Handle<Object>(Smi::FromInt(value)), &exc);
  CHECK(String::cast(print_string)->IsEqualTo(CStrVector(string)));
}


static void CheckNumber(double value, const char* string) {
  Object* obj = Heap::NumberFromDouble(value);
  CHECK(obj->IsNumber());
  bool exc;
  Object* print_string = *Execution::ToString(Handle<Object>(obj), &exc);
  CHECK(String::cast(print_string)->IsEqualTo(CStrVector(string)));
}


static void CheckFindCodeObject() {
  // Test FindCodeObject
#define __ assm.

  Assembler assm(NULL, 0);

  __ nop();  // supported on all architectures

  CodeDesc desc;
  assm.GetCode(&desc);
  Object* code = Heap::CreateCode(desc,
                                  NULL,
                                  Code::ComputeFlags(Code::STUB),
                                  Handle<Object>(Heap::undefined_value()));
  CHECK(code->IsCode());

  HeapObject* obj = HeapObject::cast(code);
  Address obj_addr = obj->address();

  for (int i = 0; i < obj->Size(); i += kPointerSize) {
    Object* found = Heap::FindCodeObject(obj_addr + i);
    CHECK_EQ(code, found);
  }

  Object* copy = Heap::CreateCode(desc,
                                  NULL,
                                  Code::ComputeFlags(Code::STUB),
                                  Handle<Object>(Heap::undefined_value()));
  CHECK(copy->IsCode());
  HeapObject* obj_copy = HeapObject::cast(copy);
  Object* not_right = Heap::FindCodeObject(obj_copy->address() +
                                           obj_copy->Size() / 2);
  CHECK(not_right != code);
}

void TestHeapObjects() {
  std::cout << "TestHeapObjects::Start()" << std::endl;
  InitializeVM();

  v8::HandleScope sc;
  Object* value = Heap::NumberFromDouble(1.000123);
  CHECK(value->IsHeapNumber());
  CHECK(value->IsNumber());
  CHECK_EQ(1.000123, value->Number());

  value = Heap::NumberFromDouble(1.0);
  CHECK(value->IsSmi());
  CHECK(value->IsNumber());
  CHECK_EQ(1.0, value->Number());

  value = Heap::NumberFromInt32(1024);
  CHECK(value->IsSmi());
  CHECK(value->IsNumber());
  CHECK_EQ(1024.0, value->Number());

  value = Heap::NumberFromInt32(Smi::kMinValue);
  CHECK(value->IsSmi());
  CHECK(value->IsNumber());
  CHECK_EQ(Smi::kMinValue, Smi::cast(value)->value());

  value = Heap::NumberFromInt32(Smi::kMaxValue);
  CHECK(value->IsSmi());
  CHECK(value->IsNumber());
  CHECK_EQ(Smi::kMaxValue, Smi::cast(value)->value());

  value = Heap::NumberFromInt32(Smi::kMinValue - 1);
  CHECK(value->IsHeapNumber());
  CHECK(value->IsNumber());
  CHECK_EQ(static_cast<double>(Smi::kMinValue - 1), value->Number());

  value = Heap::NumberFromInt32(Smi::kMaxValue + 1);
  CHECK(value->IsHeapNumber());
  CHECK(value->IsNumber());
  CHECK_EQ(static_cast<double>(Smi::kMaxValue + 1), value->Number());

  // nan oddball checks
  CHECK(Heap::nan_value()->IsNumber());
  CHECK(isnan(Heap::nan_value()->Number()));

  Object* str = Heap::AllocateStringFromAscii(CStrVector("fisk hest "));
  if (!str->IsFailure()) {
    String* s =  String::cast(str);
    CHECK(s->IsString());
    CHECK_EQ(10, s->length());
  } else {
    CHECK(false);
  }

  String* object_symbol = String::cast(Heap::Object_symbol());
  CHECK(Top::context()->global()->HasLocalProperty(object_symbol));

  // Check ToString for oddballs
  CheckOddball(Heap::true_value(), "true");
  CheckOddball(Heap::false_value(), "false");
  CheckOddball(Heap::null_value(), "null");
  CheckOddball(Heap::undefined_value(), "undefined");

  // Check ToString for Smis
  CheckSmi(0, "0");
  CheckSmi(42, "42");
  CheckSmi(-42, "-42");

  // Check ToString for Numbers
  CheckNumber(1.1, "1.1");

  CheckFindCodeObject();

  std::cout << "TestHeapObjects::End()" << std::endl;
}

int main(int argc, char* argv[]) {
  TestHeapObjects();
  return 0;
}
