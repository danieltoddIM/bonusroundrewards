'use strict';
const screenDialog=document.querySelector('#screen-dialog');
const expandedScreen=document.querySelector('#expanded-screen');
document.querySelectorAll('.screen-link').forEach(link=>link.addEventListener('click',event=>{
 if(!screenDialog || typeof screenDialog.showModal!=='function')return;
 event.preventDefault();expandedScreen.src=link.getAttribute('href');expandedScreen.alt=link.querySelector('img').alt;screenDialog.showModal();
}));
screenDialog.addEventListener('click',event=>{if(event.target!==screenDialog)return;const r=screenDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)screenDialog.close();});
