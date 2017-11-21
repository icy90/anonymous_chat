# anonymous_chat

* Develop Env:  
  * Docker version 17.06.1-ce, build 874a737  
  * Python 2.7.10  
  * docker-py@1.10.6  
  * ansible 2.3.1.0  
  * ansible-playbook 2.3.1.0  
    
* App using:  
  * Node v6  
  * RabbitMQ v3.6
  * Web Socket  
  
# How to run:  
> git clone https://github.com/icy90/anonymous_chat.git  
> cd anonymous_chat.git/ansible  
> // ansible-playbook -i 'localhost,' deploy-anonymous-chat.yml -e 'VERSION={VERSION_Here}'  
> ansible-playbook -i 'localhost,' deploy-anonymous-chat.yml -e 'VERSION=2'  

then open browser, hit for http://localhost/
