import React, {useEffect, useRef,useMemo} from 'react';
import useSVGCanvas from './useSVGCanvas.js';
import * as d3 from 'd3';

//change the code below to modify the bottom plot view
export default function WhiteHatStats(props){
    //this is a generic component for plotting a d3 plot
    const d3Container = useRef(null);
    //this automatically constructs an svg canvas the size of the parent container (height and width)
    //tTip automatically attaches a div of the class 'tooltip' if it doesn't already exist
    //this will automatically resize when the window changes so passing svg to a useeffect will re-trigger
    const [svg, height, width, tTip] = useSVGCanvas(d3Container);

    const margin = 50;
    const radius = 10;


    //TODO: modify or replace the code below to draw a more truthful or insightful representation of the dataset. This other representation could be a histogram, a stacked bar chart, etc.
    //this loop updates when the props.data changes or the window resizes
    //we can edit it to also use props.brushedState if you want to use linking
    useEffect(()=>{
        //wait until the data loads
        if(svg === undefined | props.data === undefined){ return }

        //aggregate gun deaths by state
        const data = props.data.states;
        
        //get data for each state
        const plotData = [];
        for(let state of data){
            const dd = drawingDifficulty[state.abreviation];
            let entry = {
                'count': state.count,
                'name': state.state,
                'easeOfDrawing': dd === undefined? 5: dd,
                'genderRatio': state.male_count/state.count,
            }
            plotData.push(entry)
        }


        //get transforms for each value into x and y coordinates
        let xScale = d3.scaleLinear()
            .domain(d3.extent(plotData,d=>d.easeOfDrawing))
            .range([margin+radius,width-margin-radius]);
        let yScale = d3.scaleLinear()
            .domain(d3.extent(plotData,d=>d.count))
            .range([height-margin-radius,margin+radius]);


        //draw a line showing the mean values across the curve
        //this probably isn't actually regression
        const regressionLine = [];
        for(let i = 0; i <= 10; i+= 1){
            let pvals = plotData.filter(d => Math.abs(d.easeOfDrawing - i) <= .5);
            let meanY = 0;
            if(pvals.length > 0){
                for(let entry of pvals){
                    meanY += entry.count/pvals.length
                }
            }
            let point = [xScale(i),yScale(meanY)]
            regressionLine.push(point)
        }
        
        //scale color by gender ratio for no reason
        let colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0,1])
        
        // Use area instead of radius for encoding gun deaths
        // Create a bar plot
        const barWidth = (width - 2 * margin) / plotData.length;

        svg.selectAll('.bar').remove();
        svg.selectAll('.bar')
            .data(plotData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', (d, i) => margin + i * barWidth)
            .attr('y', d => yScale(d.count))
            .attr('width', barWidth - 1)
            .attr('height', d => height - margin - yScale(d.count))
            .attr('fill', d => colorScale(d.genderRatio))
            .on('mouseover', (e, d) => {
                // Tooltip code
                let string = `${d.name}<br>Gun Deaths: ${d.count}`;
                props.ToolTip.moveTTipEvent(tTip, e);
                tTip.html(string);
            })
            .on('mousemove', (e) => {
                props.ToolTip.moveTTipEvent(tTip, e);
            })
            .on('mouseout', (e, d) => {
                props.ToolTip.hideTTip(tTip);
            });

        // Add x-axis with state names
        const xAxis = d3.axisBottom(xScale)
            .tickValues(plotData.map((d, i) => margin + i * barWidth + barWidth / 2))
            .tickFormat((d, i) => plotData[i].name);

        svg.append('g')
            .attr('transform', `translate(0,${height - margin})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        // Add y-axis
        const yAxis = d3.axisLeft(yScale);
        svg.append('g')
            .attr('transform', `translate(${margin},0)`)
            .call(yAxis);

        // Add x-axis label
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', 14)
            .text('State');

        // Add y-axis label
        svg.append('text')
            .attr('x', -(height / 2))
            .attr('y', 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', 14)
            .attr('transform', 'rotate(-90)')
            .text('Gun Deaths');
        //change the disclaimer here
        svg.append('text')
            .attr('x',width-20)
            .attr('y',height/3)
            .attr('text-anchor','end')
            .attr('font-size',10)
            .text("Data scaled by population and represented ethically");

        //draw basic axes using the x and y scales
        svg.selectAll('g').remove()
        svg.append('g')
            .attr('transform',`translate(0,${height-margin+1})`)
            .call(d3.axisBottom(xScale))

        svg.append('g')
            .attr('transform',`translate(${margin-2},0)`)
            .call(d3.axisLeft(yScale))
        
    },[props.data,svg]);

    return (
        <div
            className={"d3-component"}
            style={{'height':'99%','width':'99%'}}
            ref={d3Container}
        ></div>
    );
}
//END of TODO #1.

 
const drawingDifficulty = {
    'IL': 9,
    'AL': 2,
    'AK': 1,
    'AR': 3,
    'CA': 9.51,
    'CO': 0,
    'DE': 3.1,
    'DC': 1.3,
    'FL': 8.9,
    'GA': 3.9,
    'HI': 4.5,
    'ID': 4,
    'IN': 4.3,
    'IA': 4.1,
    'KS': 1.6,
    'KY': 7,
    'LA': 6.5,
    'MN': 2.1,
    'MO': 5.5,
    'ME': 7.44,
    'MD': 10,
    'MA': 6.8,
    'MI': 9.7,
    'MN': 5.1,
    'MS': 3.8,
    'MT': 1.4,
    'NE': 1.9,
    'NV': .5,
    'NH': 3.7,
    'NJ': 9.1,
    'NM': .2,
    'NY': 8.7,
    'NC': 8.5,
    'ND': 2.3,
    'OH': 5.8,
    'OK': 6.05,
    'OR': 4.7,
    'PA': 4.01,
    'RI': 8.4,
    'SC': 7.1,
    'SD': .9,
    'TN': 3.333333,
    'TX': 8.1,
    'UT': 2.8,
    'VT': 2.6,
    'VA': 8.2,
    'WA': 9.2,
    'WV': 7.9,
    'WY': 0,
}
