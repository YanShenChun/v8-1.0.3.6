shell:shell.cc
	g++ -m32 -pthread -I../include -L.. -lv8_g -g shell.cc -o shell

process:process.cc
	g++ -m32 -pthread -I../include -L.. -lv8_g -g process.cc -o process

clean:
	rm -f shell process
