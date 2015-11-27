/*
  137573155@qq.com
  支持子容器
*/

(function($)
{
		
		var  panelclass="qsplitter-panel";
		var  splitbarclass="qsplitter-splitbar";
		var  lefticonclass="lefticon";
		
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
			//唯一ID,方便调试
			this.id=seq++;
			this.element=target;//html元素
			this.options;//选项 		移动下限this.options.min; 移动上限this.options.max
			this.containerwidth;//容器宽度
			this.containerheight;//容器高度
			this.dragbeforepoint;//拖动之前的点
			this.splitbarelement;//分割条
			this.panelfirst;//第一个panel  left 或者top
			this.panelsencond;//第二个panel  right或者bottom
			this.childcontainner;//子容器
			this.lefticon;//左边箭头元素
			this.render=function()
			{
					this.containerwidth=this.element.width();
					this.containerheight=this.element.height();
					//console.log(this.id +"  containerwidth:"+this.containerwidth+"  containerheight:"+this.containerheight);
					var panels=this.element.children("."+panelclass);
					if(panels.size()!=2)
					{
						throw "only support two panels!";
						return;
					}
					this.panelfirst=$(panels[0]);
					this.panelsencond=$(panels[1]);
					
					//获得子容器，容器大小改变的时候，要通知子容器
					this.childcontainner=this.panelfirst.children(".qsplitter-container").add(this.panelsencond.children(".qsplitter-container"));
					
					//重绘的时候需要移除以前的分隔条
					this.element.children("."+splitbarclass+"-"+this.options.direction).remove();
					
					//生成分隔条,计算第一个panel和第二个panel的位置和宽度，都是使用绝对定位
					if(this.options.direction=="h")
					{
								var splitbar=$("<div>").addClass(splitbarclass+"-"+this.options.direction).css("height",this.containerheight+"px").css("left",this.options.size+"px").css("width",this.options.barsize);
								var lefticon=$("<div>").addClass(lefticonclass).css("height","100%").css("width","5px");
								this.lefticon=lefticon;
								splitbar.append(lefticon);
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
					//console.log(this.id+" "+$(event.target).closest(this.element).length);
					if($(event.target).closest(this.element).length>0)
					{
					    //绑定事件，记录鼠标起始位置
						$(this.element).on('mousemove.qsplitter',$.proxy(this.draging,this));
						$(this.element).on('mouseup.qsplitter',$.proxy(this.end,this));
						this.dragbeforepoint={x:event.pageX,y:event.pageY};
					}
			};
			this.end=function(event)
			{
				event.stopPropagation();
				//console.log(this.id+" "+$(event.target).closest(this.element).length);
				if($(event.target).closest(this.element).length>0)
				{
					//移除事件
					$(this.element).off('mousemove.qsplitter');
					$(this.element).off('mouseup.qsplitter');
				}
				
			};
			this.draging=function(event)
			{
				event.stopPropagation();
				if($(event.target).closest(this.element).length>0)
				{
					if(this.options.direction=="h") //横向移动分割条
					{
						var distance=event.pageX-this.dragbeforepoint.x;
						this.spliting(distance);
					}else{
						var distance=event.pageY-this.dragbeforepoint.y;
						this.spliting(distance);
					}
					this.dragbeforepoint={x:event.pageX,y:event.pageY};
				}
				
			};
			
			this.spliting=function(distance)
			{
					if(this.options.direction=="h") //横向移动分割条
					{
							//鼠标移动距离 x坐标
							//分隔条移动距离
							var newleft=distance+parseInt(this.splitbarelement.css("left"));
							//移动上限
							var limitup=this.containerwidth-this.options.barsize;//默认上线为容器宽度-分隔条宽度
							if(this.options.max!=undefined && this.options.max <= limitup)
							{
								limitup=this.options.max;
							}
							var limitupafter=Math.min(newleft,limitup);
							
							
							//移动下限
							var limitdown=0;//默认为0px;
							if(this.options.min!=undefined && this.options.min >= 0)
							{
								limitdown=this.options.min;
							}
							var limitdownafter=Math.max(limitdown,limitupafter);
							//重置分隔条
							this.splitbarelement.css("left",limitdownafter+"px");
							//重置第一个panel
							this.panelfirst.width(limitdownafter+"px");
							//重置第二个panel
							
							this.panelsencond.css("width",(this.containerwidth-limitdownafter-this.options.barsize)+"px")
							.css("height",this.containerheight+"px")
							.css("left",(limitdownafter+this.options.barsize)+"px");
					}
					else  //纵向移动分割条
					{
						//同上 
						
						var newtop=distance+parseInt(this.splitbarelement.css("top"));
						
						var limitup=this.containerheight-this.options.barsize;//默认上线为容器宽度-分隔条宽度
						if(this.options.max!=undefined && this.options.max <= limitup)
						{
							limitup=this.options.max;
						}
						
						var limitupafter=Math.min(newtop,limitup);
						
						var limitdown=0;//默认为0px;
						if(this.options.min!=undefined && this.options.min >= 0)
						{
							limitdown=this.options.min;
						}
						var limitdownafter=Math.max(limitdown,limitupafter);
						
						this.splitbarelement.css("top",limitdownafter+"px");
						this.panelfirst.height(limitdownafter+"px");
						this.panelsencond
							.css("height",(this.containerheight-limitdownafter-this.options.barsize)+"px")
							.css("width",this.containerwidth+"px")
							.css("top",(limitdownafter+this.options.barsize)+"px");
					}
					
					//重新设定鼠标位置
					
					this.renderChild();
			};
			
			this.renderChild=function()
			{
				//父容器改变，通知子容器进行重置   $(this.element).on('resize',$.proxy(this.fresh,this)) ;
				this.childcontainner.trigger("resize");
			};
			
			this.fresh=function(event)
			{
				//触发子容器的时候，防止触发父容器的事件
				event.stopPropagation();
				this.render();
			}
			;
			//水平 dock,
			this.dockH=function(event)
			{
				event.stopPropagation();
				var barleft=0-parseInt(this.splitbarelement.css("left"));
				if(barleft==0)
				{
					//如果已经在最左边，设定为默认大小
					barleft=this.options.size;
				}
				this.spliting(barleft);
			};
			this.init=function(initoptions)
			{
				this.options=initoptions;
				this.render();
				
				$(this.element).on('mousedown.qsplitter',$.proxy(this.start,this)) ;
				//监听容器改变大小
				$(this.element).on('resize',$.proxy(this.fresh,this)) ;
				
				if(this.lefticon !=null )
				{
					this.lefticon.on("dblclick",$.proxy(this.dockH,this));
				}
				
			};
		}
}
)(jQuery);
	