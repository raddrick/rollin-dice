var svgns = "http://www.w3.org/2000/svg";
window.rs = {};
rs = {
  groups:0,
  dice:0,
  view:null,
  model:null,
  controller:null
};

rs.model = {
  x:0,
  y:0,
  extend: function(props,new_obj) {
    var prop, obj;
    if (new_obj) obj = Object.create(this);
    for(prop in props) {
      if(props.hasOwnProperty(prop)) {
        if (new_obj)
          obj[prop] = props[prop];
        else
          this[prop] = props[prop];
      }
    }
    return new_obj ? obj : this;
  }
};

rs.controller = {
  models:[],
  views:[],
  init:function(o){

    // check for array
    for (var i=0 ; i< o.length ; i++){
      var obj=o[i];

      //create a new model
      var m=Object.create(rs.model);
      if (obj.u) m.extend({update:obj.u});
      this.models.push({id:obj.id, o:m});

      // create a coresponding view
      var v=Object.create(rs.view);
      if (obj.v) v.extend({update:obj.v});
      this.views.push({id:obj.id, o:v.init(obj)});
    }

    return this;
  },
  update:function(models){

    //upgrade models to an array if a string
    if (typeof models != 'undefined') {
      if (typeof models.index != 'undefined')
        models = [models];
    }

    //work through the models and update their content
    for (var i=0 ; i<this.models.length ; i++){
      var m=this.models[i];

      // if the model is set it will update it only, otherwise update all
      if (typeof models == 'undefined' || models.indexOf(m.id) >= 0){
        for (var j=0 ; j<this.views.length ; j++){
          var v=this.views[j];
          if (v.id === m.id){

            //apply the new model details to the view
            if (typeof m.o.update == 'undefined') break;
            if (typeof v.o.update == 'undefined') break;
            v.o.update(m.o.update());
            //return true;
          }
        }
      }
    }
  },
  get: function(model){
    for (var i=0; i<this.models.length; i++){
      var m=this.models[i];
      if (model != m.id) continue;
      return{
        v:this.views[i],
        m:this.models[i]
      }
    }
    return 0;
  }
};

rs.view = {
  el:null,
  init:function(o){
    function selector(type){
      function get_selector(){
        return o.el.substring(1,(o.el.length));
      }
      var css='';
      switch(type){
        case 'id':
          css=document.getElementById(get_selector());
          break;
        case 'class':
          // TODO: make this capable of working on a set of elements
          css=document.getElementsByClassName(get_selector())[0];
          break;
        default:
          // TODO: make this capable of working on a set of elements
          css=document.getElementsByTagName(o.el)[0];
          break;
      }
      if (!css) console.log('Warning: no elements found with selector: ' + o.el);
      return css;
    }
    if (o){

      //sanity check for single selector
      if (o.el.indexOf(' ')>0) {console.log('Warning: multiple selectors detected, TODO: add multi-class support'); return 0;}

      if (o.el.indexOf("#")===0) {this.el = selector('id');}
      else if (o.el.indexOf(".")===0) {this.el = selector('class');}
      else {this.el = selector();}
    }
    if (this.el.getAttribute('type') == 'text/template') this.template = this.el.firstChild;
    return this;
  },
  render:function(m){
    var dom = this.el;
    if (this.template) dom = this.convert_template(m);

    // TODO: this is new, needs to be tested
    // for (var attr in m){
    //   if (typeof m[attr] == 'object'){
    //     dom.setAttribute(attr,m[attr][1]);
    //     m[attr]=m[attr][1];
    //   }
    // }

    //reapply the updated element
    if (typeof dom == 'undefined'){
      return false;
    } else {
      return dom;
    }
  },
  set_transform: function(el,m){
    if (!m.y) m.y=0;
    if (!m.x) m.x=0;
    var template='translate({{x}} {{y}})';
    if (el) el.setAttribute('transform',
      this.update_template(template,
        {x:m.x, y:m.y}
      )
    );
  },
  convert_template: function(m){
    if (this.template){
      if (typeof this.template == 'object') this.template = this.template.data;
      var res = this.update_template(this.template,m);
      var parser = new DOMParser();
      res=parser.parseFromString(res, "image/svg+xml");
      return res.firstChild;
    } else {
      console.log("Warning: no template found for this view");
      return false;
    }
  },
  update_template: function(t,v){
    for(var prop in v) {
      if(v.hasOwnProperty(prop)) {
        // {{x}} for x, replace
        var re = new RegExp("({{" + prop + "}})");
        t = t.replace(re, v[prop]);
      }
    }
    return t;
  },
  extend: function(props,new_obj) {
    var prop, obj;
    if (new_obj) obj = Object.create(this);
    for(prop in props) {
      if(props.hasOwnProperty(prop)) {
        if (new_obj)
          obj[prop] = props[prop];
        else
          this[prop] = props[prop];
      }
    }
    return new_obj ? obj : this;
  }
};