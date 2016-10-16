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
    var tempEndDate = this.dataset[this.dataset.length - 1].date.getTime();
    var endDate = new Date(tempEndDate).setDate(new Date(tempEndDate).getDate() + 1);
    this.xScale = d3.scaleTime()
      .domain([this.dataset[0].date, endDate])
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
    this.chartGroup.selectAll('.candle-rect').data(this.dataset, (o) => o.date)
      .enter()
      .append('rect')
      .attr('x', (o) => this.xScale(o.date))
      .attr('y', (o) => this.yScale(Math.min(o.open, o.close)))
      .attr('height', (o) => this.yScale(Math.min(o.open, o.close)) - this.yScale(Math.max(o.open, o.close)) + 1)
      .attr('width', this.candleWidth)
      .style('fill', (o) => o.open > o.close ? 'blue' : 'red');

    this.chartGroup.selectAll('.candle-line').data(this.dataset, (o) => o.date)
      .enter()
      .append('line')
      .attr('x1', (o) => this.xScale(o.date) + this.candleWidth/2)
      .attr('x2', (o) => this.xScale(o.date) + this.candleWidth/2)
      .attr('y1', (o) => this.yScale(o.low))
      .attr('y2', (o) => this.yScale(o.high))
      .attr("stroke", (o) => o.open > o.close ? 'blue' : 'red');
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
