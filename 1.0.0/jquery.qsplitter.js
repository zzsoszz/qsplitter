(function($)
{
		
		var  panelclass="qsplitter-panel";
		var  splitbarclass="qsplitter-splitbar";
		var  defaultoptions = {
			direction      : "h",
		};
		
		$.fn.qsplitter=function()
		{
			//调用函数
			//$("#mysplitter").splitter("load");
			//$("#mysplitter").splitter("options","disable","true");
			//初始化实例
			//$("#mysplitter").splitter({"direction":h});
			
			var isMethodCall=arguments.length>0 && typeof arguments[0] === "string";
			if(isMethodCall)
			{
				//调用函数
				var methodname=arguments[0];
				var args = Array.prototype.slice.call(arguments,1);
				this.each(function() {
					var instance = $.data( this, "qsplitter" );
					if(instance && $.isFunction( instance[methodname] ))
					{
						var method=instance[options];
						method.apply(instance,args);
					}
				});
				
			}else{
				var inputoptions = arguments;
				$(this).each(
						function ()
						{
							var optionsnew = $.extend( {}, defaultoptions);
							if(inputoptions.length>0)
							{
									optionsnew=$.extend(optionsnew,inputoptions[0]);
							}
							var instance=$(this).data("qsplitter");
							if(instance)
							{
								instance.init(optionsnew);
							}else
							{
								var target=$(this);
								instance=new QSplitter(target);
								instance.init(optionsnew);
								$(this).data("qsplitter",instance);
							}
						}
					);
					return this;
				};
				
		}
		var seq=0;
		function QSplitter(target)
		{
			this.id=seq++;
			this.element=target;//html元素
			this.options;//选项
			this.containerwidth;//容器宽度
			this.containerheight;//容器高度
			this.dragbeforepoint;//拖动之前的点
			this.splitbarelement;//分割条
			this.panelfirst;//第一个panel
			this.panelsencond;//第二个panel
			this.render=function()
			{
					this.containerwidth=this.element.width();
					this.containerheight=this.element.height();
					var panels=this.element.children("."+panelclass);
					if(panels.size()!=2)
					{
						return;
					}
					this.panelfirst=$(panels[0]);
					this.panelsencond=$(panels[1]);
					if(this.options.direction=="h")
					{
								var splitbar=$("<div>").addClass(splitbarclass+"-"+this.options.direction).css("height",this.containerheight+"px").css("left",this.options.size+"px").css("width",this.options.barsize);
								this.panelfirst.css("height",this.containerheight+"px").css("width",this.options.size+"px").after(splitbar);
								this.panelsencond.css("height",this.containerheight+"px").css("width",(this.containerwidth-this.options.size-this.options.barsize)+"px").css("left",(this.options.size+this.options.barsize)+"px");
					}
					else
					{
						var splitbar=$("<div>").addClass(splitbarclass+"-"+this.options.direction).css("width",this.containerwidth+"px").css("top",this.options.size+"px").css("height",this.options.barsize);;
						this.panelfirst.css("width",this.containerwidth+"px").css("height",this.options.size+"px").after(splitbar);
						this.panelsencond.css("width",this.containerwidth+"px").css("height",(this.containerheight-this.options.size-this.options.barsize)+"px").css("top",(this.options.size+this.options.barsize)+"px");
					}
					this.splitbarelement=this.element.children("."+splitbarclass+"-"+this.options.direction);
			};
			this.start=function(event)
			{
					event.stopPropagation();
					console.log(this.id+" "+$(event.target).closest(this.element).length);
					if($(event.target).closest(this.element).length>0)
					{
						$(this.element).on('mousemove.qsplitter',$.proxy(this.draging,this));
						$(this.element).on('mouseup.qsplitter',$.proxy(this.end,this));
						this.dragbeforepoint={x:event.pageX,y:event.pageY};
					}
			};
			this.end=function(event)
			{
				event.stopPropagation();
				console.log(this.id+" "+$(event.target).closest(this.element).length);
				if($(event.target).closest(this.element).length>0)
				{
					$(this.element).off('mousemove.qsplitter');
					$(this.element).off('mouseup.qsplitter');
				}
			};
			this.draging=function(event)
			{
				event.stopPropagation();
				if($(event.target).closest(this.element).length>0)
				{
					if(this.options.direction=="h")
					{
							var distance=event.pageX-this.dragbeforepoint.x;
							var newleft=distance+parseInt(this.splitbarelement.css("left"));
							var limitup=Math.min(newleft,this.containerwidth-this.options.barsize);
							var limitdown=Math.max(0,limitup);//如果为负数这取0
							this.splitbarelement.css("left",limitdown+"px");
							this.panelfirst.width(limitdown+"px");
							this.panelsencond.css("width",(this.containerwidth-limitdown-this.options.barsize)+"px")
							.css("height",this.containerheight+"px")
							.css("left",(limitdown+this.options.barsize)+"px");
					}
					else
					{
						var distance=event.pageY-this.dragbeforepoint.y;
						var newtop=distance+parseInt(this.splitbarelement.css("top"));
						var limitup=Math.min(newtop,this.containerheight-this.options.barsize);
						var limitdown=Math.max(0,limitup);//如果为负数这取0
						this.splitbarelement.css("top",limitdown+"px");
						this.panelfirst.height(limitdown+"px");
						this.panelsencond
							.css("height",(this.containerheight-limitdown-this.options.barsize)+"px")
							.css("width",this.containerwidth+"px")
							.css("top",(limitdown+this.options.barsize)+"px");
					}
					//重新设定鼠标位置
					this.dragbeforepoint={x:event.pageX,y:event.pageY};
				}
				
				
			};
			this.init=function(initoptions)
			{
				this.options=initoptions;
				this.render();
				$(this.element).on('mousedown.qsplitter',$.proxy(this.start,this)) ;
			};
		}
}
)(jQuery);
	