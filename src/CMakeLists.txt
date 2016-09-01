set(tools_path  ${PROJECT_SOURCE_DIR}/tools)
set(tmp_out_path ${PROJECT_BINARY_DIR}/tmp)
set(libraries_source_files 
  "${CMAKE_CURRENT_SOURCE_DIR}/runtime.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/v8natives.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/array.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/string.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/uri.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/math.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/messages.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/apinatives.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/debug-delay.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/mirror-delay.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/date-delay.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/regexp-delay.js"
  "${CMAKE_CURRENT_SOURCE_DIR}/macros.py"
)

set(sources 
  "accessors.cc"
  "allocation.cc"
  "api.cc"
  "assembler.cc"
  "ast.cc"
  "bootstrapper.cc"
  "builtins.cc"
  "checks.cc"
  "codegen.cc"
  "code-stubs.cc"
  "compilation-cache.cc"
  "compiler.cc"
  "contexts.cc"
  "conversions.cc"
  "counters.cc"
  "dateparser.cc"
  "debug.cc"
  "disassembler.cc"
  "execution.cc"
  "factory.cc"
  "flags.cc"
  "frames.cc"
  "global-handles.cc"
  "handles.cc"
  "hashmap.cc"
  "heap.cc"
  "ic.cc"
  "interpreter-irregexp.cc"
  "jsregexp.cc"
  "log.cc"
  "mark-compact.cc"
  "messages.cc"
  "mksnapshot.cc"
  "objects.cc"
  "parser.cc"
  "property.cc"
  "regexp-macro-assembler.cc"
  "regexp-macro-assembler-irregexp.cc"
  "regexp-stack.cc"
  "rewriter.cc"
  "runtime.cc"
  "scanner.cc"
  "scopeinfo.cc"
  "scopes.cc"
  "serialize.cc"
  "snapshot-common.cc"
  "snapshot-empty.cc"
  "spaces.cc"
  "string-stream.cc"
  "stub-cache.cc"
  "token.cc"
  "top.cc"
  "unicode.cc"
  "usage-analyzer.cc"
  "utils.cc"
  "v8.cc"
  "v8-counters.cc"
  "v8threads.cc"
  "variables.cc"
  "zone.cc"
)

set(sources ${sources} 
  "assembler-ia32.cc"
  "builtins-ia32.cc"
  "codegen-ia32.cc"
  "cpu-ia32.cc"
  "debug-ia32.cc"
  "disasm-ia32.cc"
  "frames-ia32.cc"
  "ic-ia32.cc"
  "macro-assembler-ia32.cc"
  "regexp-macro-assembler-ia32.cc"
  "simulator-ia32.cc"
  "stub-cache-ia32.cc")

if (CMAKE_SYSTEM_NAME MATCHES "Linux")
  set(sources ${sources} "platform-linux.cc")
endif()

set(v8_cxx_flags "-pedantic -Wall -w -W -Wno-unused-parameter -ansi -m32 -fno-rtti -fno-exceptions -fPIC -DENABLE_LOGGING_AND_PROFILING")
set(v8_c_flags "-w -ansi -m32 -fPIC -DENABLE_LOGGING_AND_PROFILING")

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${v8_cxx_flags}")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${v8_c_flags}")

string(TOLOWER "${CMAKE_BUILD_TYPE}" build_type)

if(build_type STREQUAL "debug")
  set(sources ${sources} 
    "objects-debug.cc"
    "prettyprinter.cc"
    "regexp-macro-assembler-tracer.cc")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O0 -DENABLE_DISASSEMBLER -DDEBUG")
endif()


set(LIBRARY_OUTPUT_PATH ${PROJECT_BINARY_DIR}/lib)
include_directories(${PROJECT_SOURCE_DIR}/include)

add_library(v8_artifact SHARED ${sources})

#add_custom_command(
#  OUTPUT ${tmp_out_path}/libraries.cc ${tmp_out_path}/libraries-empty.cc
#  COMMAND ${tools_path}/js2c.py ${tmp_out_path}/libraries.cc ${tmp_out_path}/libraries-empty.cc CORE ${libraries_source_files}
#)
add_custom_target(
  build_js
  COMMAND mkdir ${tmp_out_path}
  COMMAND ${tools_path}/js2c.py ${tmp_out_path}/libraries.cc ${tmp_out_path}/libraries-empty.cc CORE ${libraries_source_files}
)



