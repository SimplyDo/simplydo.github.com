"use strict";angular.module("simplydoApp",["ngTouch"]),angular.module("simplydoApp").controller("MainCtrl",["$scope",function(a){a.products=[{id:"faces",url:"http://simplydo.com/faces/",label:"Faces",description:"A simple exploration. You can download the faces to use at avatars or whatever else you see fit."},{id:"focus",url:"http://simplydo.com/focus",label:"Focus",description:"An easy to use task manager that helps you to work smarter."},{id:"markdown",url:"http://simplydo.com/markDown/",label:"Mark Down",description:"Mark Down editor with real time preview and html source output."},{id:"cryptography",url:"http://simplydo.com/cryptography/",label:"Cryptography Project",description:"Encrypt and decrypt any text right in your browser. You can also generate random key phrases from the list of 39,000 English words. Nothing is ever sent to a server! Build in a mere hours with learning in mind. The sources are open."},{id:"lifestacks",url:"http://simplydo.com/lifeStacks/",label:"Life Stacks",description:"Create and share Life Stacks."},{id:"balance",url:"http://simplydo.com/projector/",label:"Balance Projector",description:"Balance Projector can provide quick insights into your immediate financial future. The real time interface updates on every change and makes somewhat abstract numbers very tangible. Build in a mere hours with learning in mind. The sources are open."},{id:"currencies",url:"http://simplydo.com/currencies/",label:"Currencies",description:"Enter multiple balances in different currencies and convert them all at once. In real time."}],a.currentYear=function(){var a=new Date;return a.getFullYear()}}]);