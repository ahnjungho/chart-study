import * as d3 from "d3";

class CandlestickChart {
  constructor(config) {
    console.log('init CandlestickChart');
    this.config = config;
    this.initParams();
    this.initChart();
  }

  initParams() {
    console.log("initParams");
    this.selectChart = d3.select(this.config.bindto);
    this.targetElement = this.selectChart.node();
    this.margin = this.config.margin || {top: 30, right: 60, bottom: 30, left: 60};
    this.width = this.targetElement.getBoundingClientRect().width - this.margin.left - this.margin.right;
    this.height = this.targetElement.getBoundingClientRect().height - this.margin.top - this.margin.bottom;
  }

  updateParams() {
    var tempStartDate = this.dataset[0].date.getTime();
    var startDate = new Date(tempStartDate).setDate(new Date(tempStartDate).getDate() - 1);
    var tempEndDate = this.dataset[this.dataset.length - 1].date.getTime();
    var endDate = new Date(tempEndDate).setDate(new Date(tempEndDate).getDate() + 1);
    this.xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, this.width]);

    this.yScale = d3.scaleLinear()
      .domain([d3.min(this.dataset.map((o) => o.low)) * 0.5, d3.max(this.dataset.map((o) => o.high))])
      .range([this.height, 0]);

    this.candleWidth = this.xScale(new Date()) - this.xScale(new Date().setDate(new Date().getDate() - 1)) - 2;
  }

  initChart() {
    console.log("initChart");
    this.svg = d3.select(this.config.bindto).append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr('class', 'candlestic-svg');

    this.gridLineGroup = this.svg.append("g")
      .attr('class', 'gridline-group')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.axisGroup = this.svg.append("g")
      .attr('class', 'axis-group')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.chartGroup = this.svg.append("g")
      .attr('class', 'chart-group')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.tooltip = this.selectChart
      .append("div")
      .attr("class", "candlestic-tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("opacity", 0)
      .style("border", "1px solid #aaa")
      .style("background-color", "#fff")
      .style("font-size", "12px")
      .style("padding", "3px");
  }

  drawAxis() {
    var that = this;
    this.axisGroup
      .append('g')
      .attr("transform", "translate(" + this.width + ",0)")
      .call(d3.axisRight(that.yScale));

    this.axisGroup
      .append('g')
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(that.xScale));
  }

  drawGridLines() {
    var that = this;
    this.gridLineGroup.append("g")
      .attr("class", "grid grid-y")
      .call(
        d3.axisLeft(that.yScale)
          .tickSize(-this.width, 0, 0)
          .tickFormat("")
      );

    this.gridLineGroup.append("g")
      .attr("class", "grid grid-x")
      .call(
        d3.axisBottom(that.xScale)
          .tickSize(this.height, 0, 0)
          .tickFormat("")
      );

    this.svg.selectAll(".grid .tick line")
      .attr('stroke', '#eee');

    this.svg.selectAll(".grid .domain")
      .attr('stroke', '#eee');
  }

  drawCandles() {
    var that = this;
    this.chartGroup.selectAll('.candle-line').data(this.dataset, (o) => o.date)
      .enter()
      .append('line')
      .transition()
      .duration(500)
      .on("start", function() {
        d3.select(this)
          .attr('x1', (o) => that.xScale(o.date))
          .attr('x2', (o) => that.xScale(o.date))
          .attr('y1', (o) => that.yScale(o.open))
          .attr('y2', (o) => that.yScale(o.open))
          .attr("stroke", (o) => o.open > o.close ? 'blue' : 'red');
      })
      .attr('x1', (o) => this.xScale(o.date))
      .attr('x2', (o) => this.xScale(o.date))
      .attr('y1', (o) => this.yScale(o.low))
      .attr('y2', (o) => this.yScale(o.high))
      .attr("stroke", (o) => o.open > o.close ? 'blue' : 'red');

    this.chartGroup.selectAll('.candle-rect').data(this.dataset, (o) => o.date)
      .enter()
      .append('rect')
      .on("mouseover", this.mouseOver(this.tooltip))
      .on("mousemove", this.mouseMove(this.tooltip))
      .on("mouseout", this.mouseOut(this.tooltip))
      .transition()
      .duration(500)
      .on("start", function() {
        d3.select(this)
          .attr('x', (o) => that.xScale(o.date) - that.candleWidth/2)
          .attr('y', (o) => that.yScale(o.open))
          .attr('width', that.candleWidth)
          .attr('height', 0);
      })
      .attr('x', (o) => this.xScale(o.date) - this.candleWidth/2)
      .attr('y', (o) => this.yScale(Math.max(o.open, o.close)))
      .attr('height', (o) => this.yScale(Math.min(o.open, o.close)) - this.yScale(Math.max(o.open, o.close)) + 1)
      .attr('width', this.candleWidth)
      .style('fill', (o) => o.open > o.close ? 'blue' : 'red');
  }

  mouseOver(tooltip) {
    var that = this;
    return function (d, i) {
      var openRate = i === 0 ? 0 : ((d.open - that.dataset[i-1].close)/that.dataset[i-1].close * 100).toFixed(2);
      var closeRate = i === 0 ? 0 : ((d.close - that.dataset[i-1].close)/that.dataset[i-1].close * 100).toFixed(2);
      var lowRate = i === 0 ? 0 : ((d.low - that.dataset[i-1].close)/that.dataset[i-1].close * 100).toFixed(2);
      var highRate = i === 0 ? 0 : ((d.high - that.dataset[i-1].close)/that.dataset[i-1].close * 100).toFixed(2);
      var html = `${d.date.toString().split(' ', 4).join(' ')}
                  <br>open: ${d.open}(${openRate}%)
                  <br>close: ${d.close}(${closeRate}%)
                  <br>high: ${d.high}(${highRate}%)
                  <br>low: ${d.low}(${lowRate}%)
                  `;
      tooltip.html(html);
      return tooltip.transition().duration(10).style("opacity", 1);
    }
  }

  mouseMove(tooltip) {
    return () => tooltip.style("top", (d3.event.pageY-10)+"px").style("left", (d3.event.pageX+10)+"px");
  }

  mouseOut(tooltip) {
    return () => tooltip.transition().duration(10).style("opacity", 0);
  }

  loadData(dataset) {
    console.log(dataset);
    this.dataset = dataset;
    this.updateParams();
    this.drawAxis();
    this.drawGridLines();
    this.drawCandles();
  }
}

export {CandlestickChart}
