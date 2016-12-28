.PHONY: build publish test setup

build: 
	python setup.py sdist bdist_wheel

publish: build test
	twine upload dist/* --skip-existing

test: build
	nosetests

setup:
	pip install -r dev-requirements.txt

clean:
	rm -f dist/*
