Polymer('permission-edit',{
    /*
    function for loading permissions from a permissions.yml
    */
    loadPermissions: function() {
        //clear all exsisting groups and worlds
        this.groups = [];
        this.worlds = [];
        
        for(group in this.jsnew.groups){
            //add the new group to the groups array
            var index = this.groups.push(JSON.parse(JSON.stringify(this.jsnew.groups[group])));
            //set the name of the group
            this.groups[index-1].name = group;
       
            //add a clear permissions object to the group
            this.groups[index-1].worlds_new = {};

            //add a clear world object if there isn't one
            if(!this.groups[index-1].worlds){
                this.groups[index-1].worlds = {};
            }
            
            this.groups[index-1].worlds.global = {};
            this.groups[index-1].worlds.global.permissions = this.groups[index-1].permissions;
            
            for(world in this.groups[index-1].worlds){
                this.groups[index-1].worlds_new[world] = {};
                
                var worldexist = false;
                
                for(var k = 0; k < this.worlds.length; k++){
                    if(this.worlds[k].name == world){
                        worldexist = true;
                        break
                    }
                }
                
                if(!worldexist){
                    var newworld = {};
                    newworld.name = world
                    
                    this.worlds.push(newworld);
                }
                
                
                for(var i = 0; i < this.groups[index-1].worlds[world].permissions.length; i++){
                    //save the unedited plugin
                    var pluginrow = this.groups[index-1].worlds[world].permissions[i].split(".")[0];
                    //get the name of the plugin (the main key of the permission)
                    var plugin = pluginrow.replace(/-/, '');
                    //create a clear permissions object
                    var permission = {};
                    //add the name to the permission
                    permission.name = this.groups[index-1].worlds[world].permissions[i].replace(/-/, '');

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
                    if(!this.groups[index-1].worlds_new[world][plugin]){
                        //create it if not
                        this.groups[index-1].worlds_new[world][plugin] = {};

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
                    this.groups[index-1].worlds_new[world][plugin][permission.name] = ((pluginrow.charAt(0) == '-')?false:true);
                     
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
            }
            
            //copy the new worlds to the worlds key
            this.groups[index-1].worlds = this.groups[index-1].worlds_new;
            //delet the new permission key
            delete this.groups[index-1].worlds_new;
            delete this.groups[index-1].permissions;
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
        var worldindex = e.target.templateInstance.model.SelectedWorld;
        var world = this.worlds[worldindex].name;
        
        //test if the group has a permission of the plugin else create a clear object to save these permissions at
        if(!group.worlds[world][plugin]) group.worlds[world][plugin] = {};  
               
        //reverse the value of the permission
        group.worlds[world][plugin][permission.name] = !group.worlds[world][plugin][permission.name];
        
        //call the methode for setting related permissions
        this.setoutherpermissions(plugin,pluginindex,permission.name,group,world);
        
        //set the permissions of outher worlds when the default world is changed
        if(worldindex == 0){
            for(var i = 0; i < this.worlds.length; i++){
                var worldi = this.worlds[i].name;
                //test if the group has a permission of the plugin else create a clear object to save these permissions at
                if(!group.worlds[worldi][plugin]) group.worlds[worldi][plugin] = {};  
               
                //set the value of the permission
                group.worlds[worldi][plugin][permission.name] = group.worlds[world][plugin][permission.name];
                //and for each related one
                this.setoutherpermissions(plugin,pluginindex,permission.name,group,worldi);
            }
        }
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
    
    //for the loaded translation
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
                if(world == "global"){
                    this.js.groups[groups[i].name].permission = [];
                    for(var plugin in group.worlds[world]){
                        for(var permission in group.worlds[world][plugin]){
                            this.js.groups[groups[i].name].permission.push(group.worlds[world][plugin][permission]?permission:'-' + permission);

                        }
                    }
                } else {
                    this.js.groups[groups[i].name].worlds[world] = {};
                    this.js.groups[groups[i].name].worlds[world].permission = [];
                    for(var plugin in group.worlds[world]){
                        for(var permission in group.worlds[world][plugin]){
                            this.js.groups[groups[i].name].worlds[world].permission.push(group.worlds[world][plugin][permission]?permission:'-' + permission);
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
    
    //for the plugins
    permissions: [],
    
    //init groups
    'groups': [
        { 
            'name': 'Admin', 
            'worlds': {
                'global': {},
                'world': {}
            }
        },
        {
            'name': 'Spieler',
            'worlds': {
                'global': {},
                'world': {}
            }
        },
        { 
            'name': 'Gast',
            'worlds': {
                'global': {},
                'world': {}
            }
        }
    ],
    
    /*
    funktions for open the dialogs
    */
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
    openaddpermissionfkt: function(e){
        //set the plugin to the selected one
        this.addplugin = e.target.templateInstance.model.plugin
        this.openaddpermission = true;
    },
    openeditworldfkt: function(e){
        //only if its not the default world
        if(e.target.templateInstance.model.index != 0){
            this.openeditworld = true;  
        }
    },
    openeditgroupfkt: function(e){
        this.openeditgroup = true;
        //set the edit group to the selected group
        this.editgroup = e.target.templateInstance.model.group;
        //set the defaultbutton to the right value (only works if options are there)
        if(this.editgroup.options){
            this.$.editdefaultbutton.active = this.editgroup.options.default;
        }
        //and toggel the background of the default button so he has the right design
        this.$.editdefaultbutton.toggleBackground();
    },
    
    /*
    delets the selected group
    
    @param e eventdata
    */
    delGroup: function(e){
        //get the group thats button is pushed
        var delgroup = e.target.templateInstance.model.group
        
        //splice the element out of the array
        this.groups.splice(this.groups.indexOf(delgroup),1);
        //and save to google analytics
        _gaq.push(['_trackEvent', 'group', 'delete', delgroup.name]); 
    },
    
    /*
    delets the selected plugin
    
    @param e eventdata
    */
    delplugin: function(e){
        //get the pluginname and the index
        var pluginindex = e.target.templateInstance.model.index;
        var name = e.target.templateInstance.model.plugin.plugin;
        
        //delet the element from the array
        this.permissions.splice(pluginindex,1);
        
        //delet the plugin from each world
        for(var i = 0; i < this.groups.length; i++){
            for(world in this.groups[i].worlds){
                if(this.groups[i].worlds[world][name]){
                    delete this.groups[i].worlds[world][name];
                }
            }
        }
        
        //readd the plugin to the addselector
        this.plugins.push(name);
        
        //save stat data to google analytics
        _gaq.push(['_trackEvent', 'plugin', 'delete', name]); 
    },
    
    //select the default world
    SelectedWorld: 0,
    
    /*
    delets the selected world
    
    @param e eventdata
    */
    delworld: function(e){
        //get the name and index from the html
        var worldindex = e.target.templateInstance.model.index;
        var name = e.target.templateInstance.model.world.name;
        //test if it's isn't the first world
        if(worldindex != 0){
            //select the default world so we have one selected
            this.SelectedWorld = 0;
            //delete the world from the array
            this.worlds.splice(worldindex,1);
            //delete the world form the groupdata
            for(var i = 0; i < this.groups.length; i++){
                if(this.groups[i].worlds[name]){
                    delete this.groups[i].worlds[name];
                }
            }
            
            //save stat data to google analytics
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
    
    //set the validation of the newGroup to true, at init
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
    
    //no import for new worlds and the name is valid
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
    
    addpermission: function(){
        this.openaddpermission = false;
        var plugin = this.addplugin;
        if(this.addpermissionimport){
            var permission = JSON.parse(JSON.stringify(plugin.permissions[this.addpermissionimport - 1]));
            for(parent in permission.parents){
                for(var i = 0; i < plugin.permissions.length; i++){
                    if(plugin.permissions[i].name == parent){
                        plugin.permissions[i].children[this.addpermissionname] = true;
                    }
                }
            }
            for(child in permission.children){
                for(var i = 0; i < plugin.permissions.length; i++){
                    if(plugin.permissions[i].name == child){
                        plugin.permissions[i].parents[this.addpermissionname] = true;
                    }
                }
            }
        }else{
            var permission = {};
        }
        
        if(this.addpermissiondescription){
            permission.description = this.addpermissiondescription;
        }
        
        permission.name = this.addpermissionname;
        plugin.permissions.push(permission);
        
        this.addpermissiondescription = undefined;
        this.addpermissionname = undefined;
        this.addpermissionimport = undefined;
    },

    //list of currend languages
    langs: {
        "de": "de",
        "en": "en"
    },
    
    //init worlds
    worlds: [
        {
            name: "global"
        },
        {
            name: "world"
        }
    ],

    /*
    set everything ready for loading a plugin.json
    */
    startaddplugin: function(){
        //get the index of the plugin
        var index = this.plugins.indexOf(this.newpluginname);
        //index != -1 -> plugin is in list
        if(index != -1){
            //set the name of the getplugin ajax
            this.newpluginnameconfirmed = this.newpluginname;
            //start the ajax
            this.$.getplugin.go();
            //delete the plugin from the list
            this.plugins.splice(index,1);
            //clear the selected plugin
            this.newpluginname = "";
        }
    }
});

/*Google Analytics stuff*/
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-60277501-2']);
_gaq.push(['_gat._anonymizeIp']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();