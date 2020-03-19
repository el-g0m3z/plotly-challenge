function buildMetadata(sample) {

  const meta = d3.select("#sample-metadata")
  meta.html("")

  let s = d3.json(`/metadata/${sample}`).then((data) => {
    Object.entries(data).forEach(([key, value]) => { meta.append("p").text(`${key.toLowerCase()}: ${value}`) })
  })

  // BONUS: Build the Gauge Chart
  // buildGauge(data.WFREQ);
}

function buildCharts(sample) {

  let s = d3.json(`/samples/${sample}`).then((data) => {

    //Sort the data to grab top 10 for Pie Chart
    let dataObj = data.otu_ids.map((e, i) => [e, data.otu_labels[i], data.sample_values[i]])
    dataObj.sort((a, b) => b[2] - a[2])
    let topData = dataObj.slice(0, 10)
    let otuIds = []
    let otuLabels = []
    let sampleValues = []
    topData.forEach((e) => { otuIds.push(e[0]), otuLabels.push(e[1]), sampleValues.push(e[2]) })

    //Make Pie Chart
    var pieData = [{
      values: sampleValues,
      labels: otuIds,
      hovertext: otuLabels,
      type: 'pie'
    }];

    var pieLayout = {
      height: 500,
      width: 500
    };

    Plotly.newPlot("pie", pieData, pieLayout)

    //Make Bubble Chart
    var bubbleTrace = {
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,
      mode: 'markers',
      marker: {
        size: data.sample_values,
        color: data.otu_ids
      }
    }

    var bubbleData = [bubbleTrace]

    var bubbleLayout = {
      showlegend: false,
      height: 600,
      width: 1400,
      xaxis: {
        title: {
          text: 'OTU ID'
        }
      }
    }

    Plotly.newPlot('bubble', bubbleData, bubbleLayout)

  })
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  console.log(`option changed: ${newSample} selected`)
  buildCharts(newSample);
  buildMetadata(newSample);
}


// Initialize the dashboard
init();