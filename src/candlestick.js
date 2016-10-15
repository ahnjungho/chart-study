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
    this.margin = this.config.margin || {top: 30, right: 30, bottom: 30, left: 30};
    this.width = this.targetElement.getBoundingClientRect().width - this.margin.left - this.margin.right;
    this.height = this.targetElement.getBoundingClientRect().height - this.margin.top - this.margin.bottom;
  }

  updateParams() {
    this.xScale = d3.scaleTime()
      .domain([this.dataset[0].date, this.dataset[this.dataset.length - 1].date])
      .range([0, this.width]);

    this.yScale = d3.scaleLinear()
      .domain([d3.min(this.dataset.map((o) => o.low)), d3.max(this.dataset.map((o) => o.high))])
      .range([0, this.height]);

    this.candleWidth = this.xScale(new Date()) - this.xScale(new Date().setDate(new Date().getDate() - 1)) - 1;
  }

  initChart() {
    console.log("initChart");
    this.svg = d3.select(this.config.bindto).append('svg')
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr('class', 'candlestic-svg');

    this.chartGroup = this.svg.append("g")
      .attr('class', 'chart-group')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  }

  drawCandles() {
    this.chartGroup.selectAll('.candle-rect').data(this.dataset, (o) => o.date)
      .enter()
      .append('rect')
      .attr('x', (o) => this.xScale(o.date) - this.candleWidth/2)
      .attr('y', (o) => this.yScale(Math.min(o.open, o.close)))
      .attr('height', (o) => this.yScale(Math.max(o.open, o.close)) - this.yScale(Math.min(o.open, o.close)))
      .attr('width', this.candleWidth);
  }

  loadData(dataset) {
    console.log(dataset);
    this.dataset = dataset;
    this.updateParams();
    this.drawCandles();
  }
}

export {CandlestickChart}
