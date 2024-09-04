
const width = 800; // Define the SVG width
const height = 1200; // Define the SVG height

const size_sbg_ref = document.getElementById("graph")
// Get dimension of the graph svg
const size_sbg = size_sbg_ref.getBoundingClientRect()


const svg = d3.select("svg");

const graphGroup = svg.select(".graph");

const colorMap = {
    // "Perception": "#ffff00", // yellow #ffff00
    // "Communication": "#000000", // black #000000
    // "Confrontation": "#ffa500", // orange #ffa500
    // "Cooperation": "#008000", // green #008000
    // "Emotional": "#0000ff", // blue #0000ff
    // "Indirect": "#808080", // grey #808080
    // "Physical": "#ff0000", // red #ff0000
    // "Other": "#808080" // grey #808080
    "Perception": "#f0e68c", // khaki
    "Communication": "#4d4d4d", // dark grey
    "Confrontation": "#e69a45", // light orange
    "Cooperation": "#6b8e23", // olive green
    "Emotional": "#4682b4", // steel blue
    "Indirect": "#a9a9a9", // dark grey
    "Physical": "#cd5c5c", // indian red
    "Other": "#b0b0b0" // light grey

}

const color = function (interaction) {



    return colorMap[interaction] || "#808080"; // Default to grey if interaction is not in colorMap
}

// Function to get image URL based on character ID
function getCharacterImageUrl(id) {
    // This is a placeholder function. You'll need to implement the logic to map character IDs to image URLs.
    // For example:
    const imageMap = {
        "Higuma": "/img/Higuma_Anime_Infobox.webp",
        "Luffy": "/img/Monkey_D._Luffy_Portrait.webp",
        // Add more mappings as needed
    };
    return "/img/" + id + ".png";
}

// Set up zoom behavior, but apply to the group
svg.call(
    d3.zoom().on("zoom", (event) => {
        graphGroup.attr("transform", event.transform);
    })
);

// Set up the force simulation
const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(size_sbg.width / 2, height / 2)); // Centering force

// Load the data
d3.json("data_cleaned.json").then(function(data) {
    // Populate filter options based on data
    populateFilters(data);

    // Draw initial graph
    drawGraph(data);

    // Add event listeners to filter elements
    document.getElementById("saga").addEventListener("change", () => filterGraph(data, "saga"));
    document.getElementById("arc").addEventListener("change", () => filterGraph(data, "arc"));
    document.getElementById("episode").addEventListener("input", () => filterGraph(data, "episode"));
    document.getElementById("filler").addEventListener("change", () => filterGraph(data, "filler"));
});

function populateFilters(data) {
    // Populate Saga options
    const sagaOptions = Array.from(new Set(data.links.map(d => d.saga)));
    const sagaSelect = document.getElementById("saga");
    sagaOptions.forEach(saga => {
        const option = document.createElement("option");
        option.value = saga;
        option.text = saga;
        sagaSelect.add(option);
    });

    // Populate Arc options
    const arcOptions = Array.from(new Set(data.links.map(d => d.arc)));
    const arcSelect = document.getElementById("arc");
    arcOptions.forEach(arc => {
        const option = document.createElement("option");
        option.value = arc;
        option.text = arc;
        arcSelect.add(option);
    });
}

function drawGraph(data) {
    // legende unten rechts in die ecke zeichnen
// legende unten rechts in die ecke zeichnen
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${20}, ${height-160})`)
    .selectAll("g")
    .data(Object.keys(colorMap))
    .enter().append("g")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

// Add a background rectangle for the legend
legend.insert("rect", ":first-child")
    .attr("x", -20)
    .attr("y", -10)
    .attr("width", 150) // Adjust the width as needed
    .attr("height", (Object.keys(colorMap).length * 20) +10)
    .attr("fill", "#d2c0b2")
    .attr("rx", 5) // Add rounded corners to the background
    .attr("ry", 5);

legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", d => colorMap[d]);

legend.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text(d => d)
    .attr("font-size", "12px")
    .attr("font-family", "sans-serif")
    .attr("fill", "black")
    .attr("text-anchor", "start");


    const link = graphGroup.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("stroke-width", 2)
        .attr("stroke", d => color(d.interaction));

    const nodeGroup = graphGroup.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(data.nodes)
        .enter().append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));



        // Define a generic clip path
    svg.append("defs").append("clipPath")
        .attr("id", "circle-clip")
        .append("circle")
        .attr("r", 20);

    // Add the character images
    nodeGroup.append("image")
        .attr("xlink:href", d => getCharacterImageUrl(d.id))
        // add alternative image if image not found
        .on("error", function() {
            d3.select(this).attr("xlink:href", "/img/placeholder.png");
        })
        .attr("x", -20)
        .attr("y", -20)
        .attr("width", 40)
        .attr("height", 40)
        .attr("clip-path", "url(#circle-clip)")
        .attr("preserveAspectRatio", "xMidYMid slice");

    // Add character names below the images
    nodeGroup.append("text")
        .attr("dx", 25)
        .attr("dy", ".35em")
        .text(d => d.id)
        .attr("font-size", "10px")
        .attr("font-family", "sans-serif")
        .attr("fill", "black");

    nodeGroup.append("title")
        .text(d => d.id);

    // nodeGroup.append("circle")
    //     .attr("r", 10)
    //     .attr("fill", "#69b3a2");

    // // Add a clipPath to make the images circular
    // nodeGroup.append("clipPath")
    //     .attr("id", d => `clip-${d.id}`)
    //     .append("circle")
    //     .attr("r", 20);

    // // Add the character images
    // nodeGroup.append("image")
    //     .attr("xlink:href", d => getCharacterImageUrl(d.id))
    //     .attr("x", -20)
    //     .attr("y", -20)
    //     .attr("width", 40)
    //     .attr("height", 40)
    //     .attr("clip-path", d => `url(#clip-${d.id})`);

    // nodeGroup.append("text")
    //     .attr("dx", 12)
    //     .attr("dy", ".35em")
    //     .text(d => d.id)
    //     .attr("font-size", "10px")
    //     .attr("font-family", "sans-serif")
    //     .attr("fill", "black");

    // nodeGroup.append("title")
    //     .text(d => d.id);

    simulation.nodes(data.nodes).on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodeGroup
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    simulation.force("link").links(data.links);
}

function filterGraph(data, filterName) {

    let selectedSaga = document.getElementById("saga").value;
    let selectedArc = document.getElementById("arc").value;
    let selectedEpisode = document.getElementById("episode").value;
    let isFiller = document.getElementById("filler").checked;

    if (filterName === "saga") {
        // Reset the arc and episode filters when the saga filter changes
        document.getElementById("arc").value = "all";
        selectedArc = "all";
        document.getElementById("episode").value = "";
        selectedEpisode = "";
    } else if (filterName === "arc") {
        // Reset the episode filter when the arc filter changes
        document.getElementById("saga").value = "all";
        selectedSaga = "all";
        document.getElementById("episode").value = "";
        selectedEpisode = "";
    } else if (filterName === "episode") {
        // Reset the saga and arc filters when the episode filter changes
        document.getElementById("saga").value = "all";
        selectedSaga = "all";
        document.getElementById("arc").value = "all";
        selectedArc = "all";
    }

    // Filter links based on selected criteria
    const filteredLinks = data.links.filter(link => {
        return (selectedSaga === "all" || link.saga === selectedSaga) &&
               (selectedArc === "all" || link.arc === selectedArc) &&
               (selectedEpisode === "" || link.episode == selectedEpisode) &&
               (!isFiller || link.filler === "True");
    });

    // Update the graph with the filtered links
    const filteredNodes = Array.from(new Set(filteredLinks.flatMap(link => [link.source, link.target])));

    graphGroup.selectAll("*").remove(); // Clear previous graph
    drawGraph({ nodes: filteredNodes, links: filteredLinks }); // Redraw graph with filtered data
    // restart the simulation that the nodes place themselves in the correct position
    simulation.alpha(1).restart();

}

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

