/*
 *Copyright (c) 2011, Eduardo Miranda
 *All rights reserved.
 *
 *Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 *Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation  and/or other materials provided with the distribution.
 *Neither the name of the <ORGANIZATION> nor the names of its contributors may be used to endorse or promote products derived from this software without 
 *specific prior written permission.
 *THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function() {
    var config = new Object();
    var titles = [];
    var links = [];
    var items = [];

    var scripts = document.getElementsByTagName('script');
    var this_script = scripts[scripts.length - 1];
    var params = this_script.src.replace(/^[^\?]+\??/,'').split('&');   
 
    var url_base = ((typeof(config.url) == 'undefined') ? ('http://' + document.domain + '/') : ('http://' + config.url + '/'));

    for(var i=0; i<params.length; i++) {
        var tmp = params[i].split("=");
        config[tmp[0]] = unescape(tmp[1]);
    }

    document.write(
        '<div id="relposts">' +
            '<div id="relposts-loading">Loading related posts...</div>' +
            '<div id="relposts-title"></div>'+
            '<ul id="relposts-list"></ul>' +
        '</div>'
    );

    if(typeof(config.tags)=='undefined'){ error(0); return; }
    if(typeof(config.num)=='undefined'){ config.num=8; }
    if(typeof(config.len)=='undefined'){ config.len=60; }
    if(typeof(config.css)=='undefined'){ document.write('<link rel="stylesheet" type="text/css" href="http://relposts.googlecode.com/svn/trunk/default.css" />');}
    
    var tags = config.tags.slice(0,-1).split(',');

    $(document).ready(function() {
        function getRelated() {
            var req;
            for(var i=0; i<tags.length; i++){
                req=$.getJSON(url_base+'api/read/json?callback=?&num='+config.num+'&start=0&tagged='+escape(tags[i]), function(data) {
                    $(data.posts).each(function(i, post) {
                        var text='';
                        if(post.type=='regular') text+=post['regular-title'];
                        else if(post.type=='link') text+=post['link-text'];
                        else if(post.type=='quote') text+=post['quote-text'];
                        else if(post.type=='photo') text+=post['photo-caption'];
                        else if(post.type=='conversation') text+=post['conversation-title'];
                        else if(post.type=='video') text+=post['video-caption'];
                        else if(post.type=='audio') text+=post['audio-caption'];
                        else if(post.type=='answer') text+=post['question'];
                        if(text.length>config.len){ text=text.slice(0,config.len); text+='...';}
                        titles.push(text.replace(/(<[^<>]*>)/g, ""));
                        links.push(post['url-with-slug']);                        
                    });
                    
                }).complete(getList);
            }
            
        }
        function getList(){
            for(var i=0; i<titles.length; i++){
                var regex = new RegExp('('+links[i]+')');
                var html = $("#relposts-list").html();

                if(links[i]!=document.location&&!html.match(regex)){
                    if(config.num--<=0) return;
                
                    var item='<li class="relposts-item"><a class="relposts-link" href="'+links[i]+'">'+titles[i]+'</a></li>';
                    $("#relposts-list").append(item);
                }
            }
            $("#relposts-title").html('Related posts:');
            $("#relposts-loading").html('');
        }
        getRelated();
        
    });

    function getError(e){
        var msg="error: ";
        switch(e){
            case 0: msg+='no tags defined'; break;
            case 1: msg+='tumblr API problem'; break;
        }
        $("#relposts-loading").html(msg);
    }
})();
