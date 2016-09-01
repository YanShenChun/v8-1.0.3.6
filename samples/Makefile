shell:shell.cc
	g++ -m32 -pthread -I../include -L.. -lv8_g -g shell.cc -o shell

process:process.cc
	g++ -m32 -pthread -I../include -L.. -lv8_g -g process.cc -o process


CC_FLAGS=-fno-rtti -fno-exceptions -pedantic -Wall -w -W -Wno-unused-parameter -g3 -gdwarf-2 -O0 -ansi -fPIC -DENABLE_LOGGING_AND_PROFILING -DENABLE_DISASSEMBLER -DDEBUG

test-mark-stack:test-mark-stack.cc
	g++ -m32 $(CC_FLAGS) -pthread -I../src -L.. -lv8_g test-mark-stack.cc -o test-mark-stack

test-heap-object:test-heap-object.cc
	g++ -m32 $(CC_FLAGS) -pthread -I../src -L.. -lv8_g test-heap-object.cc -o test-heap-object

clean:
	rm -f shell process test-mark-stack test-heap-object
