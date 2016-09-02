#include <stdlib.h>
#include <iostream>
#include "v8.h"

#include "global-handles.h"
#include "snapshot.h"
#include "top.h"

//using namespace v8;
//using namespace v8::internal;
using namespace v8::internal;

void TestMarkingStack() {
  // if not comment this, it will cause gdb 'segment fault' issue on src/thirdparty/dtoa/dtoa.c
  std::cout << "TestMarkingStack::start" << std::endl;
  int mem_size = 20 * kPointerSize;
  byte* mem = NewArray<byte>(20*kPointerSize);
  Address low = reinterpret_cast<Address>(mem);
  Address high = low + mem_size;
  MarkingStack s;
  s.Initialize(low, high);

  Address address = NULL;
  while (!s.is_full()) {
    s.Push(HeapObject::FromAddress(address));
    address += kPointerSize;
  }

  while (!s.is_empty()) {
    Address value = s.Pop()->address();
    address -= kPointerSize;
    CHECK_EQ(address, value);
  }

  CHECK_EQ(NULL, address);
  DeleteArray(mem);

  std::cout << "TestMarkingStack::end" << std::endl;
}

int main(int argc, char* argv[]) {
  TestMarkingStack();
  return 0;
}
