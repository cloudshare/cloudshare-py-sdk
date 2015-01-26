#!/usr/bin/python
import cssdk, time

API_ID = "5VLLDABQSBESQSKY"
API_KEY = "4P3RuSCfFbLQvqJqrBWWrxcxIjZHdlz1CkFqQR4jkIftn3C6wTGfcTawQNMKshUo"

def main():
	env = get_first_env()
	machine = get_first_machine(env)
	execution = execute_path(machine, "echo hello world")
	execution_status = get_execution_status(machine, execution)
	while not execution_status['success']:
		time.sleep(5)
		execution_status = get_execution_status(machine, execution)
	print "Execution finished! output:\n%s" % execution_status['standardOutput']

def get_first_env():
	envs = get('envs/')
	if len(envs) == 0:
		raise Exception("You don't have any environments!")
	if get_env_status(envs[0]) != "Ready":
		raise Exception("Your first environment is not running!")
	print "I found the \"%s\" environment." % envs[0]['name']
	return envs[0]

def get_env_status(env):
	return get('/envs/actions/getExtended', {'envId': env['id']})['statusText']

def get_first_machine(env):
	machines = get('envs/actions/machines/', {'eid': env['id']})
	if len(machines) == 0:
		raise Exception("Your first environment doesn't have any machines!")
	print "I'm going to execute \"echo hello world\" on the machine \"%s\" machine in environment \"%s\" ." % (machines[0]['name'], env['name'])
	return machines[0]

def execute_path(machine, command):
	return post('/vms/actions/executePath', {
		'vmId': machine['id'],
		'path': command	
	})

def get_execution_status(machine, execution):
	print "polling execution status..."
	return get("vms/actions/checkExecutionStatus", {
		'vmId': machine['id'],
		'executionId': execution['id']
	});

def post(path, content=None):
	return request('POST', path, content=content)

def get(path, queryParams=None):
	return request('GET', path, queryParams=queryParams)

def request(method, path, queryParams=None, content=None):
	res = cssdk.req(hostname="use.cloudshare.com",
					 method=method,
					 apiId=API_ID,
					 apiKey=API_KEY,
					 path=path,
					 queryParams=queryParams,
					 content=content)
	if res.status / 100 != 2:
		raise Exception(res)
	return res.content

if __name__ == "__main__":
	main()