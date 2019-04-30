jQuery(function ($){
    var ENTER_KEY=13;

    var util = {
        uuid: function(){
            var i, random;
                var uuid = '';

                for (i = 0; i < 32; i++) {
                    random = Math.random() * 16 | 0;
                    if (i === 8 || i === 12 || i === 16 || i === 20) {
                        uuid += '-';
                    }
                    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
                }

                return uuid;
        }
    };

    var App = {
        init: function(){
            this.items = [];
            this.template = Handlebars.compile($('#main').html());
            Handlebars.registerPartial("list", $("#list").html());
            this.bindEvents();

        }, 
        bindEvents: function(){
            $('#new-todo').on('keyup', this.create.bind(this));
            $('#todolist').on('keyup', '.newsubtodo', this.createSubItem.bind(this));
            $('#todolist').on('change', '.toggle', this.toggle.bind(this));
        }, 
        toggle: function(e){
            var $input = $(e.target);
            var id = $input.closest('li').data('id');
            for (var i=0; i<this.items.length; i++){
                this.recursiveToggle(this.items[i], id);
            }
            this.render();
        },
        recursiveToggle: function(item, id){
            if(item.id===id){
                item.completed=!item.completed;
            } else {
                for(var i=0; i<item.items.length; i++){
                    this.recursiveToggle(item.items[i], id);
                }
            }
        },
        recursiveCreate: function(item, id, value){
            if(item.id===id){
                item.items.push({
                    name: value, 
                    id: util.uuid(),
                    completed: false,
                    items: []
                });
            } else {
                for(var i=0; i<item.items.length; i++){
                    this.recursiveCreate(item.items[i], id, value);
                }
            }
        },
        createSubItem: function(e){
            var $input = $(e.target);
            var val = $input.val().trim();
            var id = $(e.target).closest('li').data('id');
            if (e.which !== ENTER_KEY || !val){
                return;
            }
            for(var i=0; i<this.items.length; i++){
                this.recursiveCreate(this.items[i], id, val);
            }
            console.log("items are: ", this.items);
            this.render();

        },
        create: function(e){
            var $input = $(e.target);
            var val = $input.val().trim();
            if (e.which !== ENTER_KEY || !val){
                return;
            }
    
            this.items.push(
                {
                    name: val, 
                    id: util.uuid(),
                    completed: false,
                    items: []
                }
            );
            $input.val('');
            console.log("items are: ", this.items);
            this.render();
        },
        render: function(){
            console.log("this.items is ", this.items);
            var html = this.template({items: this.items});
            $("#todolist").html(html);
        }
    };


    App.init();



});