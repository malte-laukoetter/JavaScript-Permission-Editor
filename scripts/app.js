Polymer('permission-edit',{
    loadPermissions: function() {
        this.groups = [];
        for(group in this.jsnew.groups){
            var index = this.groups.push(this.jsnew.groups[group]);
            this.groups[index-1].name = group;
       
            this.groups[index-1].permissions_new = {};
            
            for(var i = 0; i < this.groups[index-1].permissions.length; i++){
                
                var split = this.groups[index-1].permissions[i].split(".");
                var pluginrow = split[0];
                var plugin = pluginrow.replace(/-/, '');
                var permission = split.slice(1).join('.');
                var pluginid = 0;
                
                var k = 0;
                for(var j = 0; j < this.permissions.length; j++){
                    if(this.permissions[j].plugin !== plugin) {
                        k++;
                    }else{
                        pluginid = j;
                        break;
                    }
                }
                
                if(!this.groups[index-1].permissions_new[plugin]){
                    this.groups[index-1].permissions_new[plugin] = {};
                    
                    
                    console.log(k + ':' + this.permissions.length);
                    
                    if(k > this.permissions.length){
                        pluginid = k;
                        this.permissions[pluginid] = {};
                        this.permissions[pluginid].plugin = plugin;
                        this.permissions[pluginid].permissions = [];
                    }
                }
                
                this.groups[index-1].permissions_new[plugin][permission] = ((pluginrow.charAt(0) == '-')?false:true);
                
                k = 0;
                for(var j = 0; j < this.permissions[pluginid].permissions.length; j++){
                    if(this.permissions[pluginid].permissions[j] !== permission){
                        k++;
                    }
                }
                console.log(k + ':' + this.permissions[pluginid].permissions.length);
                if(k >= this.permissions[pluginid].permissions.length && permission !== '*' && permission !== ''){
                    this.permissions[pluginid].permissions.push(permission);
                }
            }
            
            this.groups[index-1].permissions = this.groups[index-1].permissions_new;
            delete this.groups[index-1].permissions_new;
        }
        
        this.ready();
    },
    
    toggle: function(e) {
        this.$["collapse" + e.path[0].outerText].toggle();
    },
    
    alltrue: function(data) {
        console.log(data);
        for(var i = 0; i < data.length; i++){
            console.log(data[i]);
        }  
    },
    
    checkboxchanged: function(e) {
        plugin = e.target.templateInstance.model.__proto__.plugin.plugin;
        pluginindex = e.target.templateInstance.model.__proto__.index;
        permission = e.target.templateInstance.model.__proto__.permisson;
        group = e.target.templateInstance.model.group;
        
        
        if(!group.permissions[plugin]) group.permissions[plugin] = {};
        
        group.permissions[plugin][permission] = !group.permissions[plugin][permission];
        
        var truepermissions = 0;
        
        var permissionlist = this.permissions[pluginindex].permissions;
        
        for(var permission in permissionlist){
            if(group.permissions[plugin].hasOwnProperty(permissionlist[permission])){
                if(group.permissions[plugin][permissionlist[permission]] == true && !group.permissions[plugin]['*']){
                    truepermissions++;
                }
            }else{
                group.permissions[plugin][permissionlist[permission]] == false
            }
        }

        if(truepermissions >= Object.keys(this.permissions[pluginindex].permissions).length){
            group.permissions[plugin]['*'] = true;
        }else{
            group.permissions[plugin]['*'] = false;
        }
    },
    
    allcheckboxchanged: function(e) {
        var plugin = e.target.templateInstance.model.__proto__.plugin.plugin;
        pluginindex = e.target.templateInstance.model.__proto__.index;
        var group = e.target.templateInstance.model.group;
        
        if(!group.permissions[plugin]) group.permissions[plugin] = {};
        
        var newState = !group.permissions[plugin]['*'];
        group.permissions[plugin]['*'] = newState
        
        var permissionlist = this.permissions[pluginindex].permissions;
        
        for(var permission in permissionlist){
            group.permissions[plugin][permissionlist[permission]] = newState;
        }
    },
    
    ready: function(){   
        for(var group in this.groups){
            var i = 0;
            for(var plugin in this.groups[group].permissions){
                if(this.groups[group].permissions[plugin]['*']){
                    stateall = this.groups[group].permissions[plugin]['*'];
                    
                    for(var j = 0; j < this.permissions.length; j++){
                        if(this.permissions[j].plugin == plugin){
                            var permissionlist = this.permissions[j].permissions;
                            break;
                        }
                    }

                    for(var permission in permissionlist){                  
                        if(typeof this.groups[group].permissions[plugin][permissionlist[permission]] == 'undefined'){
                            this.groups[group].permissions[plugin][permissionlist[permission]] = stateall;
                            
                        }else{
                            this.groups[group].permissions[plugin]['*'] = false;
                        }
                    }
                }
                i++;
            }
        }
    },
    
    save: function(){
        this.js = {};
        this.js.groups = {};
        var groups = JSON.parse(JSON.stringify(this.groups));
        for(var j = 0; j < groups.length; j++){
            var group = groups[j];
            
            this.js.groups[group.name] = groups[j];
            
            this.js.groups[group.name].permissions_new = [];
            
            for(plugin in this.js.groups[group.name].permissions){
                for(permission in this.js.groups[group.name].permissions[plugin]){
                    this.js.groups[group.name].permissions_new.push((this.js.groups[group.name].permissions[plugin][permission]?'':'-') + plugin + "." + permission);
                }
            }
            
            this.js.groups[group.name].permissions = this.js.groups[group.name].permissions_new;
            delete this.js.groups[group.name].permissions_new;
            delete this.js.groups[group.name].name;
        }
    },

    'permissions': [
        {
            plugin: "essentials",
            permissions:[
                'xmppspy',
                'xmpp',
                'worth',
                'world',
                'workbench',
                'whois',
                'weather',
                'warps.*',
                'warp.overwrite.*',
                'warp.otherplayers',
                'warp.list',
                'warp',
                'vanish.see',
                'vanish.pvp',
                'vanish.others',
                'vanish.interact',
                'vanish.effect',
                'vanish',
                'unlimited.others',
                'unlimited.item-bucket',
                'unlimited.item-all',
                'unlimited',
                
            ]
        },
        {
            plugin: "chestlock",
            permissions:[
                'openown',
                'openall',
                'place',
                'destoryown',
                'destoryall'
            ]
        },
        {
            plugin: "lagg",
            permissions:[
                'clear',
                'check',
                'reload',
                'killmobs',
                'area',
                'unloadchunks',
                'chunk',
                'tpchunk',
                'admin',
                'gc',
                'tps',
                'halt',
                'help'
            ]
        },
        {
            plugin: "modifyworld",
            permissions:[
                'chat',
                'spam'
            ]
        }
    ],
    
    'groups': [
        { 
            'name': 'Admin', 
            'permissions': {
                'essentials': {
                    '*': true,
                    'help': false
                }
            }
        },
        {
            'name': 'Spieler',
            'permissions': {
                'essentials': {
                    '*': true,
                    'help': false,
                    'home': true,
                    'sethome': true,
                    'back': false
                },
                'chestlock': {
                    '*': true
                },
                'modifyworld': {
                    '*': true
                }
            }
        },
        { 
            'name': 'Gast',
            'permissions': {
                'essentials': {
                    '*': true
                },
                'modifyworld': {
                    'chat': true
                }
            }
        }
    ]
});
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-60277501-2']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
