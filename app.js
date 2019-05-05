jQuery(function ($){
    var ENTER_KEY=13;
    var ESCAPE_KEY=27;

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
        }, 
        store: function(namespace, data){
            if (arguments.length>1){
                return localStorage.setItem(namespace, JSON.stringify(data));
            } else {
                var store = localStorage.getItem(namespace);
                return (store && JSON.parse(store)) || [];
            }
        }
    };

    var App = {
        init: function(){
            this.items = util.store('todos-jqeury');
            // this.items = [];
            this.template = Handlebars.compile($('#main').html());
            Handlebars.registerPartial("list", $("#list").html());
            this.bindEvents();
            this.render()

        }, 
        bindEvents: function(){
            $('#new-todo').on('keyup', this.create.bind(this));
            $('#todolist').on('keyup', '.newsubtodo', this.createSubItem.bind(this));
            $('#todolist').on('change', '.toggle', this.toggle.bind(this));
            $('#todolist').on('dblclick', 'label', this.editingMode.bind(this));
            $('#todolist').on('keyup', '.edit', this.editKeyup.bind(this));
            $('#todolist').on('focusout', '.edit', this.update.bind(this));
            $('#todolist').on('click', '.destroy', this.destroy.bind(this));
        }, 
        destroy: function(e){
            var el = e.target;
            var $el = $(el);
            var id = $el.closest('li').data('id');
            this.recursiveDestroy(this.items, id);
            this.render();

        },
        recursiveDestroy: function(items, id){
           for(var i=0; i<items.length; i++){
               if(items[i].id===id){
                   items.splice(i,1);
                   return;
               } else {
                   this.recursiveDestroy(items[i].items,id);
               }
           }
        },
        update: function(e){
            var el = e.target; 
            var $el = $(el);
            var val = $el.val().trim();

            if (!val){
                this.destroy(e);
                this.render();
                return;
            }

            if($el.data('abort')){
                //focusout event triggered because ESCAPE key was pressed which called blur() and set data('abort') to true
                console.log("update: function(e) BEFORE: $(e.target).data('abort') is  ", $(e.target).data('abort'));
                $el.data('abort', false);
                console.log("update: function(e) AFTER: $(e.target).data('abort') is ", $(e.target).data('abort'));
            } else {
                console.log("update: function(e) ELSE: $(e.target).data('abort') is ", $(e.target).data('abort'));
                //focusout event triggered because ENTER key is pressed or user clicked outside the .edit input field
                //find the element and update its value
                for(var i=0; i<this.items.length; i++){
                    this.recursiveUpdate(this.items[i],$el.closest('li').data('id'),val);
                }
            }
            this.render();
        },
        recursiveUpdate: function(item, id, newValue){
            if(item.id===id){
                item.name=newValue;
            } else {
                for(var i=0; i<item.items.length; i++){
                    this.recursiveUpdate(item.items[i], id, newValue);
                }
            }
        },
        editKeyup: function(e){
            if (e.which === ENTER_KEY){
                e.target.blur();
                console.log("e is when ENTER is pressed, ", e);
                console.log("$(e.target) is when ENTER is pressed ", $(e.target));
                console.log("$(e.target).data('abort') is ", $(e.target).data('abort'));
            }
           
            if (e.which === ESCAPE_KEY){
                console.log("ESCAPE key is pressed");
                console.log("$(e.target).data('abort') is before setting it to true ", $(e.target).data('abort'));
                $(e.target).data('abort', true).blur();
                console.log("$(e.target) is when ESCAPE is pressed ", $(e.target));
                console.log("$(e.target).data('abort') is ", $(e.target).data('abort'));
            }

        },
        editingMode: function(e){
            console.log("editing mode");
            // var $input = $(e.target).closest('li').addClass('editing').children('.edit');
            var $input = $(e.target).closest('li').children('.edit').addClass('editing');

            console.log("$(e.target).closest('li') is ",$(e.target).closest('li'));
            console.log("$(e.target).closest('li').addClass('editing') is ",$(e.target).closest('li').addClass('editing'));
            console.log("$(e.target).closest('li').addClass('editing').find('.edit') is ",$(e.target).closest('li').addClass('editing').find('.edit'));

            var tmpStr = $input.val();
            $input.val('');
            $input.val(tmpStr);
            $input.focus();  
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
            util.store('todos-jqeury', this.items);
        }
    };


    App.init();



});