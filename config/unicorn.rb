root = "/home/malev/apps/asistencia-victima/current"
working_directory root
pid "#{root}/tmp/pids/unicorn.pid"
stderr_path "#{root}/log/unicorn.log"
stdout_path "#{root}/log/unicorn.log"

listen "/tmp/unicorn.asistencia-victima.sock"
worker_processes 3
timeout 30
