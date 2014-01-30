// pass the models into the controller
rs.roller = rs.controller.init([
  {id:'die',el:'#die',
    u: function(){
      this.value=Math.floor(Math.random() * 6);
      return this;
    },
    v: function(m){
      m.value=m.value ? m.value : 6;
      var el = this.render(m);

      var nodes=el.getElementsByTagName('circle');
      for (var i = 0; i < nodes.length; i++){
        var n=nodes[i];
        var c=n.getAttribute('class');
        (c.indexOf(m.value) >= 0) ? n.removeAttribute('display') : n.setAttribute('display','none');
      }
      
      return el;
    }
  },
  {id:'dice', el:'#dice',
    u: function(){
      this.die=rs.roller.get('die');
      this.dice=[];
      for (var i=0; i<rs.dice; i++){
        var d=Object.create(this.die);
        d.y=100;
        d.x=i*120;

        this.dice.push(d);
      }
      return this;
    },
    v: function(m){
      for (var i=0; i<m.dice.length; i++){
        var el=document.createElementNS(svgns,'g');
        el.setAttribute('class','die');
        
        //set the position of the new die
        var d=m.dice[i];
        d.v.o.set_transform(el,d);
        
        //copy the content of the dice to the el
        var copy=d.v.o.update(d.m.o.update());
        for (var j=0; j<copy.childNodes.length; j++){
          el.appendChild(copy.childNodes[j].cloneNode());
        }
        this.el.appendChild(el);
      }
    }
  }
]);