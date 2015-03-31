Polymer('permission-edit',{
    /*
    function for loading permissions from a permissions.yml
    */
    loadPermissions: function() {
        //clear all exsisting groups
        this.groups = [];
        for(group in this.jsnew.groups){
            //add the new group to the groups array
            var index = this.groups.push(this.jsnew.groups[group]);
            //set the name of the group
            this.groups[index-1].name = group;
       
            //add a clear permissions object to the group
            this.groups[index-1].permissions_new = {};
            
            for(var i = 0; i < this.groups[index-1].permissions.length; i++){

                //save the unedited plugin
                var pluginrow = this.groups[index-1].permissions[i].split(".")[0];
                //get the name of the plugin (the main key of the permission)
                var plugin = pluginrow.replace(/-/, '');
                //create a clear permissions object
                var permission = {};
                //add the name to the permission
                permission.name = this.groups[index-1].permissions[i].replace(/-/, '');
                
                //a variable for the pluginid
                var pluginid = 0;
                //couter
                var k = 0;
                //search for the plugin in the permissions array
                for(var j = 0; j < this.permissions.length; j++){
                    if(this.permissions[j].plugin !== plugin) {
                        //count +1 for every plugin that is not the same as the searched
                        k++;
                    }else{
                        //set the pluginid if the plugin is the searched plugin
                        pluginid = j;
                        break;
                    }
                }

                //test if already a plugin of the name is registerd in the groups permissions
                if(!this.groups[index-1].permissions_new[plugin]){
                    //create it if not
                    this.groups[index-1].permissions_new[plugin] = {};

                    //and create a new plugin
                    if(k >= this.permissions.length){
                        //set the plugin id to k (eg. the next higher id of the permission array)
                        pluginid = k;
                        //create a new object in this
                        this.permissions[pluginid] = {};
                        //set the name to the plugin key
                        this.permissions[pluginid].plugin = plugin;
                        //add a clear array for the permissions
                        this.permissions[pluginid].permissions = [];
                    }
                }
                
                //set the value of the permission
                this.groups[index-1].permissions_new[plugin][permission.name] = ((pluginrow.charAt(0) == '-')?false:true);
                
                //reset the counter
                k = 0;
                
                for(var j = 0; j < this.permissions[pluginid].permissions.length; j++){
                    if(this.permissions[pluginid].permissions[j].name !== permission.name){
                        //count +1 for every permission thats not the same as the searchet
                        k++;
                    }
                }

                //add the permission if the permission isn't there and isn't undefined
                if(k >= this.permissions[pluginid].permissions.length && permission.name !== '' && permission.name !== undefined){
                    this.permissions[pluginid].permissions.push(permission);
                }
            }
            
            //copy the new permissions to the permissions key
            this.groups[index-1].permissions = this.groups[index-1].permissions_new;
            //delet the new permission key
            delete this.groups[index-1].permissions_new;
        }
        
        //call the ready function for some outher inits
        this.ready();
        
        //add the import to ga stat
        _gaq.push(['_trackEvent', 'action', 'import']); 
    },
    
    /*
    methode that changed the value of a checkbox and called the setoutherpermissions methode
    */
    checkboxchanged: function(e) {
        //get some data frome the html code
        var pluginindex = e.target.templateInstance.model.__proto__.SelectedPlugin;
        var plugin = this.permissions[pluginindex].plugin;
        var permission = e.target.templateInstance.model.permission;
        var group = this.groups[e.target.templateInstance.model.__proto__.SelectedGroup];
        var world = this.worlds[e.target.templateInstance.model.SelectedWorld].name;
        
        //test if the group has a permission of the plugin else create a clear object to save these permissions at
        if(!group.worlds[world][plugin]) group.worlds[world][plugin] = {};  
        
        //reverse the value of the permission
        group.worlds[world][plugin][permission.name] = !group.worlds[world][plugin][permission.name];
        
        //call the methode for setting related permissions
        this.setoutherpermissions(plugin,pluginindex,permission.name,group,world);
    },
    
    /*
    methode that sets outher permissions that are related to the given one
    
    @param  plugin       object     the plugin that the permission is related to
    @param  pluginindex  int        the index of the plugin in the permissions array
    @param  permission   object     the name of the permission
    @param  group        object     the group of the change
    @param  notsetchilds boolean    optional true: only the parent permissions are setted
    */
    setoutherpermissions: function(plugin,pluginindex,permission,group,world,notsetchilds){
        for(var i = 0; i < this.permissions[pluginindex].permissions.length; i++){
            if(this.permissions[pluginindex].permissions[i].name == permission){
                var perm = this.permissions[pluginindex].permissions[i];                
                if(!notsetchilds){
                    for(var child in perm.children){
                        
                        group.worlds[world][plugin][child] = group.worlds[world][plugin][permission]?perm.children[child]:!perm.children[child];
                        this.setoutherpermissions(plugin,pluginindex,child,group,world);
                    }
                }
                
                
                for(var parent in perm.parents){
                    if(group.worlds[world][plugin][parent] != group.worlds[world][plugin][permission]){
                        group.worlds[world][plugin][parent] = false;
                        this.setoutherpermissions(plugin,pluginindex,parent,group,world,true);
                    }
                }
                return;
            }
        }
    },
    
    translation: {},
                    
    ready: function(){  
        for(var group in this.groups){
            var i = 0;
            for(var world in this.groups.worlds){
                for(var plugin in this.groups[group].worlds[world]){
                    if(this.groups[group].worlds[world][plugin]['*']){
                        stateall = this.groups[group].worlds[world][plugin]['*'];
                    
                        var permissionlist = [];
                    
                        for(var j = 0; j < this.permissions.length; j++){
                            if(this.permissions[j].plugin == plugin){
                                permissionlist = this.permissions[j].permissions;
                                break;
                            }
                        }

                        for(var j = 0; j < permissionlist.length; j++){  
                            if(typeof this.groups[group].worlds[world][plugin][permissionlist[j].name] == 'undefined'){
                                this.groups[group].worlds[world][plugin][permissionlist[j].name] = stateall;
                            }else{
                                this.groups[group].worlds[world][plugin]['*'] = false;
                            }
                        }
                    }
                    i++;
                }
            }
        }
    },
    
    save: function(){
        this.js = {};
        this.js.groups = {};
        
        var groups = JSON.parse(JSON.stringify(this.groups));
        
        for(var i = 0; i < groups.length; i++){
            this.js.groups[groups[i].name] = {};
            this.js.groups[groups[i].name].worlds = {};
            var group = groups[i];
            for(var world in group.worlds){
                if(world == "all"){
                    this.js.groups[groups[i].name].permission = [];
                    for(var plugin in group.worlds[world]){
                        for(permission in group.worlds[world][plugin]){
                            if(group.worlds[world][plugin][permission]){
                                this.js.groups[groups[i].name].permission.push(permission);
                            }
                        }
                    }
                } else {
                    this.js.groups[groups[i].name].worlds[world] = [];
                    for(var plugin in group.worlds[world]){
                        for(var permission in group.worlds[world][plugin]){
                            if(group.worlds[world][plugin][permission]){
                                this.js.groups[groups[i].name].worlds[world].push(permission);
                            }
                        }
                    } 
                }
            }
            if(groups[i].options){
                this.js.groups[groups[i].name].options = groups[i].options;
            }
        }
        _gaq.push(['_trackEvent', 'action', 'export']); 
    },

    permissions: [],
    
    'groups': [
        { 
            'name': 'Admin', 
            'worlds': {
                'all': {
                
                },
            
                'Mainmap': {}
            }
        },
        {
            'name': 'Spieler',
            'worlds': {
                'all': {
                
                },
            
                'Mainmap': {}
            }
        },
        { 
            'name': 'Gast',
            'worlds': {
                'all': {
                
                },
            
                'Mainmap': {}
            }
        }
    ],
    
    openimportfkt: function() {
        this.openimport = true;
    },
    openexportfkt: function() {
        this.openexport = true;
    },
    openaddgroupfkt: function(){
        this.openaddgroup = true;
    },
    openaddpluginfkt: function(){
        this.openaddplugin = true;
    },
    openaddworldfkt: function(){
        this.openaddworld = true;
    },
    openaddpluginbyfilefkt: function(){
        this.openaddpluginbyfile = true;
    },
    openeditworldfkt: function(e){
        if(e.target.templateInstance.model.index != 0){
            this.openeditworld = true;  
        }
    },
    
    openeditgroupfkt: function(e){
        this.openeditgroup = true;
        this.editgroup = e.target.templateInstance.model.group;
        if(this.editgroup.options){
            this.$.editdefaultbutton.active = this.editgroup.options.default;
            this.$.editdefaultbutton.toggleBackground();
        }
    },
    
    delGroup: function(e){
        var delgroup;
        if(e.target.templateInstance.model.group){
            console.log(e.target.templateInstance.model.group)
            delgroup = e.target.templateInstance.model.group
        }else{
            this.openeditgroup = false;
            delgroup = this.editgroup;
        }
        
        this.groups.splice(this.groups.indexOf(delgroup),1);
        _gaq.push(['_trackEvent', 'group', 'delete', delgroup.name]); 
    },
    
    delplugin: function(e){
        var pluginindex = e.target.templateInstance.model.index;
        var name = e.target.templateInstance.model.plugin.plugin;
        this.permissions.splice(pluginindex,1);
        
        for(var i = 0; i < this.groups.length; i++){
            if(this.groups[i].permissions[name]){
               delete this.groups[i].permissions[name];
            }
        }
        
        this.plugins.add(name);
        
        _gaq.push(['_trackEvent', 'plugin', 'delete', name]); 
    },
    
    SelectedWorld: 0,
    
    delworld: function(e){
        this.SelectedWorld = 0;
        var worldindex = e.target.templateInstance.model.index;
        var name = e.target.templateInstance.model.world.name;
        if(worldindex !== 0){
            this.worlds.splice(worldindex,1);
            _gaq.push(['_trackEvent', 'world', 'delete', name]); 
        } 
    },
    
    changeGroupsDefault : function(){
        if(!this.editgroup.options){
            this.editgroup.options = {}
        }
        
        if(!this.editgroup.options.default){
            for(var i = 0; i < this.groups.length; i++){
                if(this.groups[i].name != this.editgroup.name){
                    if(!this.groups[i].options){this.groups[i].options = {}}
                    this.groups[i].options.default = false;
                }
            }
            this.$.editdefaultbutton.active = true;
            this.editgroup.options.default = true;
        }else{
            this.$.editdefaultbutton.active = false;
            this.editgroup.options.default = false;
        }
    },
    
    newGroup: {
        namevalid: true
    },
    
    addWorld:  function(){
        this.openaddgroup = false;
        if(this.newWorld.import){
            var newWorld = JSON.parse(JSON.stringify(this.worlds[this.newWorld.import - 1]));
        }else{
            var newWorld = {};
        }

        if(!this.newWorld.name){
            this.newWorld.namevalid = false;
            return false;
        }

        for(var i = 0; i < this.worlds.length; i++){
            if(this.newWorld.name == this.worlds[i].name){
                this.newWorld.namevalid = false;
                return false;
            }
        }

        newWorld.name = this.newWorld.name;

        _gaq.push(['_trackEvent', 'world', 'add', newWorld.name]); 
        this.worlds.push(newWorld);
    },
    
    newWorld: {
        import: 0,
        namevalid: true
    },
    
    
    
    addGroup:  function(){
        this.openaddgroup = false;
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

        _gaq.push(['_trackEvent', 'group', 'add', newGroup.name]); 
        this.groups.push(newGroup);
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
        if(newplugin.plugin != undefined){
            console.log(JSON.stringify(newplugin));
            this.permissions.push(newplugin);
            if(newplugin.plugin != this.lastplugin){_gaq.push(['_trackEvent', 'plugin', 'new', newplugin.plugin]);}
            this.lastplugin = newplugin.plugin
        }
    },
    
    openPlugin: function(){
        if(this.newpluginobj){
            this.permissions.push(this.newpluginobj);
            this.plugins.splice(this.plugins.indexOf(this.newpluginname),1);
            _gaq.push(['_trackEvent', 'plugin', 'open', this.newpluginobj.plugin]); 
        }
    },
    
    created: function() {
        var langCode = navigator.language || navigator.systemLanguage;
        var lang = langCode.toLowerCase();
        lang = lang.substr(0,2);
        if(this.langs[lang]){
            this.lang = lang;
        }else{
            this.lang = "en";
        }
    },
    
    langs: {
        "de": "de",
        "en": "en"
    },
    worlds: [
        {
            name: "all"
        },
        {
            name: "Mainmap"
        }
    ],
    
    lastplugin: undefined
});

/*Google Analytics stuff*/
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-60277501-2']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
