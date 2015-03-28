//test if works with permissions added by import of permissionsfile
//change plugins.json to new format

Polymer('permission-edit',{
    selectedVersion: 1,
    
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
                var permission = {};
                permission.name = this.groups[index-1].permissions[i];
                permission.description = "unbekannt";
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

                    if(k >= this.permissions.length){
                        pluginid = k;
                        this.permissions[pluginid] = {};
                        this.permissions[pluginid].plugin = plugin;
                        this.permissions[pluginid].permissions = [];
                    }
                }
                
                this.groups[index-1].permissions_new[plugin][permission.name] = ((pluginrow.charAt(0) == '-')?false:true);
                
                k = 0;
                for(var j = 0; j < this.permissions[pluginid].permissions.length; j++){
                    if(this.permissions[pluginid].permissions[j].name !== permission.name){
                        k++;
                    }
                }

                if(k >= this.permissions[pluginid].permissions.length && permission.name !== '*' && permission.name !== '' && permission.name !== undefined){
                    this.permissions[pluginid].permissions.push(permission);
                }
            }
            
            this.groups[index-1].permissions = this.groups[index-1].permissions_new;
            delete this.groups[index-1].permissions_new;
        }
        
        this.ready();
    },
    
    checkboxchanged: function(e) {
        var pluginindex = e.target.templateInstance.model.__proto__.SelectedPlugin;
        var plugin = this.permissions[pluginindex].plugin;
        var permission = e.target.templateInstance.model.permission;
        var group = this.groups[e.target.templateInstance.model.__proto__.SelectedGroup];
        
        if(!group.permissions[plugin]) group.permissions[plugin] = {};  
        
        group.permissions[plugin][permission.name] = !group.permissions[plugin][permission.name];
        
        this.setoutherpermissions(plugin,pluginindex,permission.name,group);
    },
    
    setoutherpermissions: function(plugin,pluginindex,permission,group,notsetchilds){
        for(var i = 0; i < this.permissions[pluginindex].permissions.length; i++){
            if(this.permissions[pluginindex].permissions[i].name == permission){
                var perm = this.permissions[pluginindex].permissions[i];
                if(!notsetchilds){
                    for(var child in perm.children){
                        group.permissions[plugin][child] = group.permissions[plugin][permission]?perm.children[child]:!perm.children[child];
                        this.setoutherpermissions(plugin,pluginindex,child,group);
                    }
                }
                
                
                for(var parent in perm.parents){
                    if(group.permissions[plugin][parent] != group.permissions[plugin][permission]){
                        group.permissions[plugin][parent] = false;
                        this.setoutherpermissions(plugin,pluginindex,parent,group,true);
                    }
                }
                return;
            }
        }
    },
                    
    ready: function(){   
        for(var group in this.groups){
            var i = 0;
            for(var plugin in this.groups[group].permissions){
                if(this.groups[group].permissions[plugin]['*']){
                    stateall = this.groups[group].permissions[plugin]['*'];
                    
                    var permissionlist = [];
                    
                    for(var j = 0; j < this.permissions.length; j++){
                        if(this.permissions[j].plugin == plugin){
                            permissionlist = this.permissions[j].permissions;
                            break;
                        }
                    }

                    for(var j = 0; j < permissionlist.length; j++){  
                        if(typeof this.groups[group].permissions[plugin][permissionlist[j].name] == 'undefined'){
                            this.groups[group].permissions[plugin][permissionlist[j].name] = stateall;
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
                    this.js.groups[group.name].permissions_new.push((this.js.groups[group.name].permissions[plugin][permission]?'':'-') + permission);
                }
            }
            
            this.js.groups[group.name].permissions = this.js.groups[group.name].permissions_new;
            delete this.js.groups[group.name].permissions_new;
            delete this.js.groups[group.name].name;
        }
    },

    permissions: [],
    
    'groups': [
        { 
            'name': 'Admin', 
            'permissions': {
                
            }
        },
        {
            'name': 'Spieler',
            'permissions': {
                
            }
        },
        { 
            'name': 'Gast',
            'permissions': {
                
            }
        }
    ],
    openimportfkt: function() {
        this.openimport = !this.openimport;
    },
    openexportfkt: function() {
        this.openexport = !this.openexport;
    },
    openaddgroupfkt: function(){
        this.openaddgroup = !this.openaddgroup;
    },
    openaddpluginfkt: function(){
        this.openaddplugin = !this.openaddplugin;
    },
    openaddpluginbyfilefkt: function(){
        this.openaddpluginbyfile = !this.openaddpluginbyfile;
    },
    newGroup: {
        namevalid: true
    },
    addGroup:  function(){
        if(this.newGroup.import){
            var newGroup = JSON.parse(JSON.stringify(this.groups[this.newGroup.import - 1]));
        }else{
            var newGroup = {};
        }

        if(!this.newGroup.name){
            this.newGroup.namevalid = false;
            return false;
        }

        for(var i = 0; i < this.groups.length; i++){
            if(this.newGroup.name == this.groups[i].name){
                this.newGroup.namevalid = false;
                return false;
            }
        }

        if(this.newGroup.prefix || this.newGroup.suffix || this.newGroup.rank || this.newGroup.default){ 
            newGroup.options = {};
        }
        newGroup.name = this.newGroup.name;

        if (this.newGroup.prefix){ newGroup.options.prefix = this.newGroup.prefix};
        if (this.newGroup.suffix){ newGroup.options.suffix = this.newGroup.suffix};
        if (this.newGroup.rank){ newGroup.options.rank = this.newGroup.rank};
        if (this.newGroup.default){ newGroup.options.default = this.newGroup.default};

        if(newGroup.options && newGroup.options.default){
            for(var i = 0; i < this.groups.length; i++){
                if(this.groups[i].options){
                    this.groups[i].options.default = false;
                }
            }
        }

        this.groups.push(newGroup);

        this.openaddgroupfkt();
    },
    loadPlugin: function(){
        var newplugin = {};
        newplugin.plugin = this.newplugin.name;
        newplugin.description = this.newplugin.description;
        newplugin.permissions = [];
        var i = 0
        for(permission in this.newplugin.permissions){
            newplugin.permissions[i] = this.newplugin.permissions[permission];
            newplugin.permissions[i].name = permission;
            for(childpermission in newplugin.permissions[i].children){
                for(var k = 0; k < newplugin.permissions.length; k++){
                    if(childpermission == newplugin.permissions[k].name){
                        if(!newplugin.permissions[k].parents){newplugin.permissions[k].parents = {}}
                        newplugin.permissions[k].parents[permission] = newplugin.permissions[i].children[childpermission];
                    }
                }
            }
            
            for(var j = 0; j < newplugin.permissions.length; j++){
                for(child in newplugin.permissions[j].children){
                    if(child == permission){
                        if(!newplugin.permissions[i].parents){newplugin.permissions[i].parents = {}}
                        newplugin.permissions[i].parents[newplugin.permissions[j].name] = newplugin.permissions[j].children[child];
                    }    
                        
                }
            }
            i++;
        }     
        console.log(JSON.stringify(newplugin));
        this.permissions.push(newplugin);
    },
    
    openPlugin: function(){
        if(this.newpluginobj){
            this.permissions.push(this.newpluginobj);
            this.plugins.splice(this.plugins.indexOf(this.newpluginname),1);
        }
    }
});
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-60277501-2']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
