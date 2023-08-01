let userInput = '';
let mindMapData = '';
let sessionID = ''; // Declare sessionID as a global variable
let selectedNode = null;
let sourceNode = null;

// Box itself
let rectWidth = 250;
let rectHeight = 50;

// relationship Box
let relationshipToolBoxRef;
let selectedLine = null;
let relationshipToolBoxWidth = 160;
let relationshipToolBoxHeight = 100;

let BoxToolBoxRef;
let boxToolBoxWidth = 160;
let boxToolBoxHeight = 100;

// 3dot Button
let dotCircle = null; // Define the variable to hold the dot circle element
let dotsText = null;

let nodes = null;

let addingrel = false;
let addingrelsource = null;
let addingreltarget = null;


const drawingContainer = document.getElementById('drawingContainer');

function resizeDrawingContainer() {
    const windowHeight = window.innerHeight;
    const chatContainerHeight = document.getElementById('chatContainer').offsetHeight;
    drawingContainer.style.height = `${windowHeight - chatContainerHeight - 150}px`;
}

window.addEventListener('resize', resizeDrawingContainer);
resizeDrawingContainer();

getsessionid();


function getRightEdgeX(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const rect = node ? node.querySelector('rect') : null;
    return node && rect ? parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]) + parseFloat(rect.getAttribute('width')) : 0;
}



function getLeftEdgeX(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    return node ? parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]) : 0;
}

function getCenterY(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const rect = node ? node.querySelector('rect') : null;
    return node && rect ? parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]) + parseFloat(rect.getAttribute('height')) / 2 : 0;
}


function renderMindMap() {
    const mindMapContainer = document.getElementById('mindMapContainer');
    mindMapContainer.innerHTML = '';

    try {


        const svg = d3.select('#mindMapContainer');

        nodes = svg
            .selectAll('.node')
            .data(mindMapData.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`) // Handle undefined coordinates
            .attr('id', (d) => `${d.id}`)
            .call(dragHandler);



        const rectNodes = nodes
            .append('rect')
            .attr('width', rectWidth)
            .attr('height', rectHeight)
            //.attr('width', (d) => d.label.length * 10 + 20)
            //.attr('height', 50)
            .attr('data-tag', 'rect')
            .attr("stroke-width", (d) => {
                return d.strokewidth;
            });

        rectNodes
            .classed('completed', (d) => d.completed)
            .style('fill', (d) => {
                //console.log(`Node ID: ${d.id}, Completed: ${d.completed}`);
                return d.completed ? '#D3D3D3' : d.fill;
                // Completed True then 
            });
        // used in the edit box then get replaced
        const foreignObjects = nodes
            .append('foreignObject')
            .attr('x', 5)
            .attr('y', 12.5) // Adjust the y position to center the checkbox vertically
            .attr('width', 30) // Increase the width to make the checkbox at least twice as big
            .attr('height', 30); // Increase the height to make the checkbox at least twice as big

        const checkboxDivs = foreignObjects
            .append('xhtml:div')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            // .on('click', (event, d) => {
            //     console.log('in the check box click ....');
            //     event.stopPropagation(); // Prevent click event from bubbling to the parent nodes
            // })
        ;

        checkboxDivs
            .append('input')
            .attr('type', 'checkbox')
            .attr('style', 'transform: scale(1.5)') // Scale the checkbox by a factor of 1.5
            .property('checked', (d) => d.completed)
            .on('change', (event, d) => toggleCompletion(mindMapData, d.id))
            // .on('click', (event) => {
            //     event.stopPropagation(); // Prevent click event from bubbling to the parent nodes
            // })
        ;

        // make selected nodes highlighted
        nodes.classed('selected', (d) => d.id === selectedNode);

        const nodeText = nodes
            .append('text')
            .attr("class", "pointer-cursor")
            .attr('x', (d) => (rectWidth) / 2)
            .attr('y', 25)
            .text((d) => d.label)
            .attr('fill', (d) => (d.completed ? '#999999' : '#000')) // Change the text color based on the completed status
            .attr('text-decoration', (d) => (d.completed ? 'line-through' : 'none')) // Apply strike-through effect based on the completed status
            .attr('alignment-baseline', 'middle')
            .attr('data-tag', 'recttext'); // Add a data attribute to the rect element;

        nodes
            .append('circle')
            .attr('cx', 5)
            .attr('cy', 5)
            .attr('r', 10)
            .attr('fill', '#0000FF')
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', 2);

        nodes
            .append('text')
            .attr('x', 6)
            .attr('y', 8)
            .text((d) => d.id)
            .attr('font-size', 10)
            .attr('fill', '#FFFFFF')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle');



        //d:     It represents the relationship object for which the curved path is being calculated. The relationship object contains information about the source node and the target node of the relationship.
        //nodes: It represents the selection of node elements in the SVG. It is used to access the node elements and retrieve their positions.
        //nodePositions: It represents a map that stores the calculated positions (x, y coordinates) of each node in the mind map. The map is used to retrieve the positions of the source and target nodes for calculating the curved path.



        // Append the <defs> element to the SVG
        const defs = svg.append('defs');

        // Create the arrowhead marker
        defs
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', '10')
            .attr('refY', '5')
            .attr('markerUnits', 'strokeWidth')
            .attr('markerWidth', '6')
            .attr('markerHeight', '6')
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 z')
            .attr('fill', '#000000');

        renderBoxToolBox();

        renderRelationships();

        // Now, after creating and updating the relationships and nodes, adjust the SVG stack
        // to ensure that nodes appear on top of relationships
        svg.selectAll('.node').each(function() {
            const node = this;
            const parentNode = node.parentNode;
            parentNode.appendChild(node); // Move the node to the end of its parent (SVG) to bring it to the front
        });

        // adding the ToolBox on top
        renderRelationToolBox();
        svg.selectAll('.box-toolbox-box').each(function() {
            const node = this;
            const parentNode = node.parentNode;
            parentNode.appendChild(node); // Move the node to the end of its parent (SVG) to bring it to the front
        });

        nodes.on("mouseover", function(event, d) {
            // console.log("A- OVERRRRRR NODES");
            //event.stopPropagation(); // Stop the mousedown event from propagating
            //d3.select(this).attr("class", "solid-relationship hover");
            ToggleButtons(event, d);
        })


        // Add the mousedown event listener to the parent container
        // the click didn't fire on the first time / it is binding on first and firing on second
        rectNodes.on('mousedown', function(event) {
            //         console.log('LLLL2-Node clicked:');
            const clickedNode = event.target.closest('.node');
            //         console.log('LLLL3-Node clicked:', clickedNode.id);
            selectNode(clickedNode.id);

        });




        // Add the mousedown event listener to the parent container
        // the click didn't fire on the first time / it is binding on first and firing on second
        nodeText.on('mousedown', function(event) {
            // console.log('LLLL2-Node clicked:');
            const clickedNode = event.target.closest('.node');
            //   console.log('LLLL3-Node clicked:', clickedNode.id);
            selectNode(clickedNode.id);
        });


        svg.on('click', (event) => {
            //   console.log("B - SVG CLICK");

            const targetClass = event.target.getAttribute("class");
            console.log("Target Class = " + targetClass);

            if (targetClass === 'solid-relationship hover' || targetClass === 'dash-relationship hover') {
                console.log("Hitting line, do nothing");
                return;
            } else {
                console.log("Clicked outside nodes, deselecting...");
                selectNode(null);
            }

            // if (!event.target || !event.target.closest('.node')) {
            //     console.log("going with null selection")
            //     selectNode(null);
            // }
        });




        function dragHandler(selection) {
            const drag = d3.drag().on('start', dragStart).on('drag', dragMove);

            selection.call(drag);

            function dragStart(event, d) {
                d3.select(this).raise().classed('active', true);
            }



            function dragMove(event, d) {
                d3.select(this).attr('transform', `translate(${event.x - 50}, ${event.y - 25})`);

                const selectedNode = mindMapData.nodes.find((node) => node.id === d.id);
                if (selectedNode) {
                    selectedNode.x = event.x - 50;
                    selectedNode.y = event.y - 25;
                }

                // console.log("node id" + d.id)
                // console.log("selectedNode.x  and y" + selectedNode.x + ", " + selectedNode.y)
                // console.log(mindMapData)

                // Update the positions of the associated lines in the mindMapData
                mindMapData.relationships.forEach((relation) => {
                    if (relation.source === d.id) {
                        relation.x1 = selectedNode.x + getRightEdgeX(nodes, selectedNode);
                        relation.y1 = selectedNode.y + getCenterY(nodes, selectedNode);
                    }
                    if (relation.target === d.id) {
                        relation.x2 = selectedNode.x + getLeftEdgeX(nodes, selectedNode);
                        relation.y2 = selectedNode.y + getCenterY(nodes, selectedNode);
                    }
                });

                d3x = event.x;
                d3y = event.y;

                //  console.log("d3x = " + d3x + ", d3y =" + d3y);
                renderMindMap();

                ToggleButtons(event, d); // so the 3 dots move with the box


            }

        }


        function updateSolidRelationships() {
            solidRelationships = svg
                .selectAll('.solid-relationship')
                .data(mindMapData.relationships.filter((relation) => relation.type === 'solid'));

            solidRelationships
                .enter()
                .append('line')
                .attr("id", (d) => (d.source + '-' + d.target))
                .attr('class', 'relationship solid-relationship')
                .attr('stroke', (d) => { return d.stroke }) // Set the color of the line to blue (you can use any color you like)
                .merge(solidRelationships) // Merge enter and update selections
                .attr('x1', (d) => {
                    if (d.source.dragging) {
                        return d.source.x + getRightEdgeX(nodes, d.source);
                    } else {
                        // console.log('x1');
                        // console.log(getRightEdgeX(nodes, d.source));
                        return getRightEdgeX(nodes, d.source);
                    }
                })
                .attr('y1', (d) => {
                    if (d.source.dragging) {
                        return d.source.y + getCenterY(nodes, d.source);
                    } else {
                        return getCenterY(nodes, d.source);
                    }
                })
                .attr('x2', (d) => {
                    if (d.target.dragging) {
                        return d.target.x + getLeftEdgeX(nodes, d.target);
                    } else {
                        return getLeftEdgeX(nodes, d.target);
                    }
                })
                .attr('y2', (d) => {
                    if (d.target.dragging) {
                        return d.target.y + getCenterY(nodes, d.target);
                    } else {
                        return getCenterY(nodes, d.target)
                    }
                })
                .attr("stroke-width", (d) => {
                    return d.strokewidth;
                }).on("mouseover", function(event, d) {
                    //console.log("overrrrrrrrrr");
                    d3.select(this).attr("class", "solid-relationship hover");
                    ToggleButtons(event, d);
                })
                .on("mouseout", function() {
                    //console.log("outtttttttt");
                    d3.select(this).attr("class", "solid-relationship");
                })
                .on("click", function() {
                    console.log("Line Clicked ....");
                    selectedLine = d3.select(this);

                });

            solidRelationships.exit().remove();
        }

        function updateCurvedRelationships() {
            curvedRelationships = svg
                .selectAll('.dash-relationship')
                .data(mindMapData.relationships.filter((relation) => relation.type === 'dash'));

            curvedRelationships
                .enter()
                .append('line')
                .attr("id", (d) => (d.source + '-' + d.target))
                .attr('class', 'relationship dash-relationship')
                .attr('stroke', (d) => { return d.stroke }) // Set the color of the line to blue (you can use any color you like)
                .merge(curvedRelationships) // Merge enter and update selections
                .attr('x1', (d) => {
                    if (d.source.dragging) {
                        return d.source.x + getRightEdgeX(nodes, d.source);
                    } else {
                        // console.log('x11111111 =' + d.source + '-' + d.target);
                        // console.log(getRightEdgeX(nodes, d.source));
                        return getRightEdgeX(nodes, d.source);
                    }
                })
                .attr('y1', (d) => {
                    if (d.source.dragging) {
                        return d.source.y + getCenterY(nodes, d.source);
                    } else {
                        return getCenterY(nodes, d.source);
                    }
                })
                .attr('x2', (d) => {
                    if (d.target.dragging) {
                        return d.target.x + getLeftEdgeX(nodes, d.target);
                    } else {
                        return getLeftEdgeX(nodes, d.target);
                    }
                })
                .attr('y2', (d) => {
                    if (d.target.dragging) {
                        return d.target.y + getCenterY(nodes, d.target);
                    } else {
                        return getCenterY(nodes, d.target);
                    }
                })
                .on("click", function() {
                    console.log("Line Clicked ....");
                    selectedLine = d3.select(this);
                })
                .attr("stroke-width", (d) => {
                    return d.strokewidth;
                })
                .on('mouseover', function(event, d) {
                    console.log('mouseover');
                    d3.select(this).attr('class', 'dash-relationship hover');
                    ToggleButtons(event, d);
                })
                .on('mouseout', function() {
                    console.log('mouseout');
                    d3.select(this).attr('class', 'dash-relationship');
                });

            curvedRelationships.exit().remove();
        }


        function renderRelationToolBox() {
            //console.log("renderRelationToolBox ...... start");
            // Create the relationship box

            const rectMargin = 20;
            const lineStrokeWidth = 2;
            const relationshipLineLength = 80;
            // Create the relationship box
            const relationshipToolBox = svg
                .append("g")
                .attr("class", "relationship-toolbox")
                .style("display", "none");

            relationshipToolBox
                .append("rect")
                .attr("class", "relationship-toolbox-rect")
                .attr("width", relationshipToolBoxWidth)
                .attr("height", relationshipToolBoxHeight);

            const boxContainer = relationshipToolBox
                .append("foreignObject")
                .attr("width", relationshipToolBoxWidth)
                .attr("height", relationshipToolBoxHeight);

            const toolboxContent = boxContainer
                .append("xhtml:div")
                .attr("class", "relationship-toolbox-content");


            const icons = [
                { icon: "bi bi-palette", text: "Color" },
                { icon: "bi bi-arrow-left-right", text: "Type" },
                { icon: "bi bi-arrows-collapse", text: "Thinner" },
                { icon: "bi-arrows-expand", text: "Thicker" },
                { icon: "bi bi-trash", text: "Delete" },
                { icon: "bi bi-textarea-t", text: "Label" },
            ];
            // Create the nodes inside the relationship box
            const relationshipTooBoxNodes = toolboxContent
                .selectAll("div")
                .data(icons)
                .enter()
                .append("div")
                .on("click", handleRelationshipToolboxNodesClick);


            relationshipTooBoxNodes
                .append("i")
                .attr("class", d => `relationship-toolbox-icons ${d.icon}`)
                .style("display", "inline-block")
                .on("click", handleRelationshipToolboxNodesClick);


            relationshipTooBoxNodes
                .append("span")
                .text(d => d.text)
                .style("margin-left", "5px")
                .on("click", handleRelationshipToolboxNodesClick);



            relationshipToolBoxRef = relationshipToolBox;

        }

        function renderBoxToolBox() {
            //console.log("renderBoxToolBox ...... start");
            // Create the relationship bo

            const rectMargin = 20;
            const lineStrokeWidth = 2;
            const relationshipLineLength = 80;
            // Create the relationship box
            const BoxToolBox = svg
                .append("g")
                .attr("class", "box-toolbox-box")
                .style("display", "none");

            BoxToolBox
                .append("rect")
                .attr("class", "box-toolbox-rect")
                .attr("width", boxToolBoxWidth)
                .attr("height", boxToolBoxHeight);

            const boxContainer = BoxToolBox
                .append("foreignObject")
                .attr("width", boxToolBoxWidth)
                .attr("height", boxToolBoxWidth);

            const toolboxContent = boxContainer
                .append("xhtml:div")
                .attr("class", "box-toolbox-content");


            const icons = [
                { icon: "bi bi-palette", text: "Color" },
                { icon: "bi bi-arrow-left-right", text: "Shape" },
                { icon: "bi bi-arrows-collapse", text: "Thinner" },
                { icon: "bi-arrows-expand", text: "Thicker" },
                { icon: "bi bi-trash", text: "Delete" },
            ];
            // Create the nodes inside the relationship box
            const boxTooBoxNodes = toolboxContent
                .selectAll("div")
                .data(icons)
                .enter()
                .append("div")
                .on("click", handleBoxToolboxNodesClick);


            boxTooBoxNodes
                .append("i")
                .attr("class", d => `relationship-toolbox-icons ${d.icon}`)
                .style("display", "inline-block")
                .on("click", handleBoxToolboxNodesClick);


            boxTooBoxNodes
                .append("span")
                .text(d => d.text)
                .style("margin-left", "5px")
                .on("click", handleBoxToolboxNodesClick);



            BoxToolBoxRef = BoxToolBox;

        }

        // Function to toggle the visibility of the dot button for a selected box
        function ToggleButtons(event, d) {
            console.log(' Mouse Over ToggleButtons');
            var dotcalcX = 0
            var dotcalcY = 0
            var pluscalcX = 0
            var pluscalcY = 0


            // Remove any existing circles with the "three-dots-circle" class
            svg.selectAll(".three-dots-group").remove();

            svg.selectAll(".plus-button").remove();


            // Create a group for the circle and text
            const dotGroup = svg
                .append("g")
                .attr("class", "three-dots-group pointer-cursor")
                .attr("visibility", "visible")
                .on('mouseover', () => dotGroup.attr("cursor", "pointer"))
                .on('mouseout', () => dotGroup.attr("cursor", "default"))
                .on('click', (event, d) => click3dotbutton(event, d));


            // Get the id of the box or line and use it as the id for the circle
            const circleId = d.id || (d.source && d.target ? `${d.source}-${d.target}` : null);

            // Create the circle with "..." text in the middle of the line
            dotCircle = dotGroup
                .append("circle")
                .attr("id", circleId) // Set the id of the circle to the box or line id
                .attr("cx", 150) // Set the initial position, you can change this value if needed
                .attr("cy", 150) // Set the initial position, you can change this value if needed
                .attr("r", 15)
                .attr("fill", "yellow")
                .attr("stroke", "black")
                .attr("stroke-width", 2);

            // Append the "..." text to the circle's parent group
            // Append a foreignObject to the circle to embed HTML content
            // Append the text inside the circle
            dotsText = dotGroup
                .append("text")
                .attr("font-size", "18px")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text("...");



            // Create the "+" button
            const plusGroup = svg
                .append("g")
                .attr("class", "plus-button pointer-cursor")
                .attr("visibility", "visible")
                .on('mouseover', () => dotGroup.attr("cursor", "pointer"))
                .on('mouseout', () => dotGroup.attr("cursor", "default"))
                .on('click', (event, d) => clickplusbutton(event, d));

            // Create the circle with "..." text in the middle of the line
            plusCircle = plusGroup
                .append("circle")
                .attr("id", circleId) // Set the id of the circle to the box or line id
                .attr("cx", 150) // Set the initial position, you can change this value if needed
                .attr("cy", 150) // Set the initial position, you can change this value if needed
                .attr("r", 10)
                .attr("fill", "yellow")
                .attr("stroke", "black")
                .attr("stroke-width", 2);


            plusText = plusGroup
                .append("text")
                .attr("font-size", "18px")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text("+");


            if (d.label) // Rectangle / Box
            {

                //calcX = d.x + (d.label.length * 10 + 20) / 2;
                dotcalcX = d.x + (rectWidth) / 2;
                dotcalcY = d.y - 15;

                pluscalcX = d.x + (rectWidth);
                pluscalcY = d.y + rectHeight;


                plusCircle.attr("cx", pluscalcX).attr("cy", pluscalcY).attr("visibility", "visible");
                plusText.attr("x", pluscalcX).attr("y", pluscalcY - 2).attr("visibility", "visible");


            }
            if (d.source) // line
            {
                // console.log(" My d.source = " + d.source)
                // console.log(" My d.target = " + d.target)
                // console.log(" My d.type = " + d.type)
                // console.log(" My d.lineid = " + d.source + '-' + d.target)

                // Find the source and target node objects
                const sourceNode = mindMapData.nodes.find((node) => node.id === d.source);
                const targetNode = mindMapData.nodes.find((node) => node.id === d.target);

                // Calculate the middle point between the source and target nodes
                const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                dotcalcX = (sourceX + targetX) / 2;
                dotcalcY = (sourceY + targetY) / 2;

            }

            //console.log("making the dotCircle visible");
            //console.log(calcX);
            // console.log(calcY);
            // console.log(dotCircle.attr('cx'));
            // console.log(dotCircle.attr('cy'));

            dotCircle.attr("cx", dotcalcX).attr("cy", dotcalcY).attr("visibility", "visible");
            dotsText.attr("x", dotcalcX).attr("y", dotcalcY - 2).attr("visibility", "visible");

            function clickplusbutton(event, d) {
                console.log("Plus Button Clicked........................");
                event.stopPropagation();
                console.log('circleId ' + circleId);
                selectedNode = circleId;
                handleAddNode();


            }

            function click3dotbutton(event, d) {
                console.log("3 Dot Clicked........................");
                event.stopPropagation();

                console.log('circleId ' + circleId);

                const targetobj = findBoxOrLine(circleId);
                if (circleId.includes('-')) { // line
                    // console.log("Found  Line id:", targetobj.id);
                    //  console.log("Found  Line x1:", targetobj.x1);

                    // console.log(targetobj);
                    toggleRelationshipToolBox(targetobj);
                } else {
                    console.log("Found  Box:", targetobj.id);
                    toggleBoxToolBox(targetobj);
                }



                dotCircle.attr("visibility", "hidden");
                dotsText.attr("visibility", "hidden");


            }

        }

        function handleBoxToolboxNodesClick(event, d) {
            console.log(`Clicked ${d.text}`);
            console.log('-----------------------------------');

            const nodeId = selectedNode.id;

            console.log(`Current/Target Box Id ${nodeId}`);

            //const nodeelement = d3.select(`#${nodeId}`);
            const nodeelement = d3.select(`#${nodeId}`);
            console.log(nodeelement);
            console.log(`nodeelement Box Id ${nodeelement.attr('id')}`);


            if (d.text === "Thicker" || d.text === "Thinner") {

                const existingStrokeWidth = parseFloat(nodeelement.select('rect').style('stroke-width'));
                console.log('-----------------------------------');
                newStrokeWidth = 0;
                if (d.text === "Thicker") {
                    newStrokeWidth = existingStrokeWidth + 1;
                } else if (d.text === "Thinner") {
                    newStrokeWidth = existingStrokeWidth - 1;
                }

                console.log("existingStrokeWidth=" + existingStrokeWidth);
                console.log("newStrokeWidth=" + newStrokeWidth);

                nodeelement.select('rect').style('stroke-width', `${newStrokeWidth}`);



                // Update the strokewidth property of the node data
                const nodeData = mindMapData.nodes.find((node) => node.id === nodeId);
                if (nodeData) {
                    console.log("updating mind map with new stroke width")
                    nodeData.strokewidth = newStrokeWidth;
                }

            } else if (d.text === "Color") {
                handleColorPalette('box', nodeId);

            }

            renderMindMap();

        }

        function handleRelationshipToolboxNodesClick(event, d) {
            console.log(`Clicked ${d.text}`);
            console.log('-----------------------------------');

            const lineId = selectedLine.attr('id');

            console.log(`Current/Target Line Id ${lineId}`);

            const lineElement = d3.select(`#${lineId}`);

            if (d.text === "Thicker" || d.text === "Thinner") {

                const currentStrokeWidth = parseFloat(lineElement.style("stroke-width"));
                newStrokeWidth = 0;
                if (d.text === "Thicker") {
                    newStrokeWidth = currentStrokeWidth + 1;
                } else if (d.text === "Thinner") {
                    newStrokeWidth = currentStrokeWidth - 1;
                }

                console.log("currentStrokeWidth=" + currentStrokeWidth);
                console.log("newStrokeWidth=" + newStrokeWidth);

                lineElement.style("stroke-width", `${newStrokeWidth}`);

                // Update the stroke-width in the mind map data
                const relationship = mindMapData.relationships.find((relation) => {
                    const slineId = `${relation.source}-${relation.target}`;
                    return slineId === lineId;
                });


                console.log('relationship =' + relationship);
                if (relationship) {
                    relationship.strokewidth = newStrokeWidth;
                    console.log('Setting the mindMapData width');
                }
                console.log('-----------------------------------');

            } else if (d.text === "Color") {
                handleColorPalette('line', lineId);

            }


        }


        // Function to find a box or line based on the circleId
        function findBoxOrLine(targetid) {
            targetobj = null;
            // Check if the circleId contains a hyphen to identify it as a line
            if (targetid.includes('-')) { // line
                // console.log("findObject Line with ID =" + targetid);
                // Update the stroke-width in the mind map data

                targetobj = d3.select(`#${targetid}`);
                console.log('targetobj=')
                console.log(targetobj)

                // targetobj = mindMapData.relationships.find((relation) => {
                //     const slineId = `${relation.source}-${relation.target}`;
                //     return slineId === targetid;
                // });
                selectedLine = targetobj;
                //console.log("findObject Line Object has ID =", targetobj);

            } else { // box
                // If the circleId does not contain a hyphen, it is for a box
                // Find the box with the given id in the mindMapData
                console.log("findObject Box with Target ID =" + targetid);
                targetobj = mindMapData.nodes.find((node) => node.id === targetid);
                selectedNode = targetobj;
            }
            return targetobj;
        }


        // Function to toggle the relationship tool box trigerred on 3 dots from line
        function toggleRelationshipToolBox(line) {
            console.log("In the ToggleRelationshipToolBox ....");
            console.log('line.id=' + line.attr('id'));
            console.log(line);
            console.log('line.x1=' + line.attr('x1'));

            // console.log('line.y1=' + line.y1);
            // console.log('line.y2=' + line.y2);

            const display = relationshipToolBoxRef.style("display");
            // console.log('display=' + display);

            if (display === "none") {
                const lineX1 = +line.attr('x1') + 130;
                const lineX2 = +line.attr('x2') + 130;
                const lineY1 = +line.attr('y1') + 30;
                const lineY2 = +line.attr('y2') + 30;
                const middleX = (lineX1 + lineX2) / 2;
                const middleY = (lineY1 + lineY2) / 2;

                relationshipToolBoxRef
                    .attr("transform", `translate(${middleX - relationshipToolBoxWidth / 2}, ${middleY - relationshipToolBoxHeight / 2})`)
                    .style("display", "block");

                console.log("relationshipToolBoxRef should now be displayed");

            } else {
                relationshipToolBoxRef.style("display", "none");
            }
        }

        // Function to toggle the relationship tool box trigerred on 3 dots from line
        function toggleBoxToolBox(box) {
            // console.log("In the ToggleBoxToolBox ....");
            console.log('box.id=' + box.id);


            const display = BoxToolBoxRef.style("display");
            // console.log('display=' + display);

            if (display === "none") {


                //calcX = d.x + (d.label.length * 10 + 20) / 2;
                calcX = box.x + (rectWidth) / 2 - 70;
                calcY = box.y - 70;


                BoxToolBoxRef
                    .attr("transform", `translate(${calcX}, ${calcY})`)
                    .style("display", "block");

                console.log("BoxToolBoxRef should now be displayed");

            } else {
                BoxToolBoxRef.style("display", "none");
            }
        }

        // Update the renderRelationships() function as shown below
        function renderRelationships() {
            updateSolidRelationships();
            updateCurvedRelationships();
        }




        // end of try
    } catch (error) {
        console.error('Failed to render mind map:', error);
    }
}


// Function to handle checkbox toggle
function toggleCompletion(mindMapData, nodeId) {
    const node = mindMapData.nodes.find((node) => node.id === nodeId);
    if (node) {
        node.completed = !node.completed;
        if (node.completed) {
            node.compdate = Date.now(); // Set the compdate attribute to the current timestamp
        } else {
            node.compdate = null; // Clear the compdate attribute
        }
        renderMindMap();
    }
}


// Function to handle selecting a box =============================
function selectNode(nodeId) {

    console.log("Selecting a Node in graph ..." + nodeId);
    console.log("selectedNode=" + selectedNode);
    console.log("addingrel=" + addingrel);

    selectionType = '';
    if (addingrel == true) {
        selectionType = 'target';
    } else {
        selectionType = 'source';

    }

    console.log("selectionType=" + selectionType);

    if (selectionType === 'source') {

        // first selection does not edit, second click will edit
        if (selectedNode == nodeId) {
            console.log('Handling Edit ...');
            // Call handleRectEdit with a slight delay to ensure proper registration of the blur event listener
            setTimeout(function() {
                handleRectEdit();
            }, 100);
        }

        selectedNode = nodeId;

        // Close the relationship tool box when a node is selected
        if (nodeId === null) {
            console.log("Hiding the Relationship Box ....");
            hideRelationshipToolBox();
            hideBoxToolBox();
        } else {

            renderMindMap(); // Re-render the mind map to apply the selection highlight

            const addButton = document.getElementById('addNodeButton');
            const editButton = document.getElementById('editButton');
            const deleteButton = document.getElementById('deleteButton');
            const relationButton = document.getElementById('addRelationButton');


            if (selectedNode) {
                addButton.disabled = false; // Enable the "Add Node" button
                editButton.disabled = false; // Enable the "Edit Node" button
                deleteButton.disabled = false; // Enable the "Delete Node" button
                relationButton.disabled = false;


            } else {
                addButton.disabled = true; // Disable the "Add Node" button
                editButton.disabled = true; // Enable the "Edit Node" button
                deleteButton.disabled = true; // Enable the "Delete Node" button
                relationButton.disabled = true;


            }

            addingrelsource = nodeId;

        }

    } else if (selectionType === 'target') {

        // Get the target node ID and return it to handleAddRelation
        addingreltarget = nodeId;

        const newRelationship = {
            id: `${addingrelsource}-${addingreltarget}`,
            source: addingrelsource,
            target: addingreltarget,
            type: 'dash',
            strokewidth: 1,
            stroke: 'black'
        };

        // Add the new relationship to the mind map data
        mindMapData.relationships.push(newRelationship);

        // Re-render the mind map to show the new relationship
        renderMindMap();
        addingrelsource = null;
        addingreltarget = null;
        addingrel = null;
    }


}

// Function to hide the relationship box
function hideRelationshipToolBox() {
    relationshipToolBoxRef.style("display", "none");
}
// Function to hide the relationship box
function hideBoxToolBox() {
    BoxToolBoxRef.style("display", "none");
}



// Listeners =============================
document.getElementById('submitButton').addEventListener('click', handleInputSubmit);
document.getElementById('saveButton').addEventListener('click', handleInputSave);
document.getElementById('openButton').addEventListener('click', handleOpen);
document.getElementById('editButton').addEventListener('click', function() {
    handleRectEdit();
});
document.getElementById('addNodeButton').addEventListener('click', function() {
    handleAddNode();
});
document.getElementById('addRelationButton').addEventListener('click', function() {
    handleAddRelation();
});

function handleAddRelation() {

    console.log('In  handleAddRelation .......');
    addingrel = true;

}





function getCurvedPath(relationship, nodes, nodePositions) {
    const sourcePosition = nodePositions.get(relationship.source);
    const targetPosition = nodePositions.get(relationship.target);

    const startX = getRightEdgeX(nodes, relationship.source);
    const startY = getCenterY(nodes, relationship.source);
    const endX = getLeftEdgeX(nodes, relationship.target);
    const endY = getCenterY(nodes, relationship.target);

    const curveX = startX + (endX - startX) / 2;
    const curveY = startY + (endY - startY) * 0.5;

    return `M ${startX},${startY} Q ${curveX},${curveY} ${endX},${endY}`;
}

function handleAddNode() {
    console.log("handleAddNode .... Start")
    if (selectedNode && mindMapData && mindMapData.nodes && mindMapData.nodes.length > 0) {
        const newNodeId = `s${mindMapData.nodes.length + 1}`;
        const selectedNodeData = mindMapData.nodes.find((node) => node.id === selectedNode);

        if (selectedNodeData) {
            const existingChildrenCount = selectedNodeData.children ? selectedNodeData.children.length : 0;
            const newNodeX = selectedNodeData.x + (existingChildrenCount + 1) * 100; // Adjust the x position of the new node
            // Find the next available position for the new node
            let nextX = newNodeX;
            while (mindMapData.nodes.some((node) => node.x === nextX && node.y === selectedNodeData.y + 100)) {
                nextX += 100;
            }


            const newNode = {
                id: newNodeId,
                label: 'Double Click to Edit',
                color: selectedNodeData.color,
                textColor: selectedNodeData.textColor,
                x: nextX,
                y: selectedNodeData.y + 100, // Adjust the y position of the new node
                children: [],
            };

            console.log("newNodeID=" + newNodeId);
            console.log("selectedNode=" + selectedNode);

            mindMapData.nodes.push(newNode);
            mindMapData.relationships.push({
                id: `${selectedNode}-${newNodeId}`,
                source: selectedNode,
                target: newNodeId,
                type: 'solid',
                strokewidth: 1,
                stroke: 'black'
            });


            selectedNode = newNodeId; // Select the new node

            // Re-render the mind map with the updated data
            renderMindMap();
        }
    }
}




function handleRectEdit() {
    console.log('Handling Edit for ' + selectedNode);
    if (selectedNode) {
        const selectedNodeId = selectedNode;
        const selectedNodeElement = document.getElementById(`${selectedNodeId}`);
        const rectext = selectedNodeElement.querySelector('text[data-tag="recttext"]');

        if (rectext) {
            console.log('Rect Text Foud ..');
            const currentText = rectext.textContent;
            console.log(currentText);
            const rectextStyle = window.getComputedStyle(rectext);

            const rectextBox = rectext.getBBox();

            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            const inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.value = currentText;

            // Set attributes to match the width, height, x, and y of the original text element
            foreignObject.setAttribute('width', rectextBox.width);
            foreignObject.setAttribute('height', rectextBox.height);
            foreignObject.setAttribute('x', rectextBox.x);
            foreignObject.setAttribute('y', rectextBox.y);
            foreignObject.setAttribute('style', 'overflow: visible');

            // Apply the same style as the original text element
            inputElement.style.fontSize = rectextStyle.fontSize;
            inputElement.style.fontWeight = rectextStyle.fontWeight;
            inputElement.style.fontFamily = rectextStyle.fontFamily;
            inputElement.style.textAnchor = rectextStyle.textAnchor;
            inputElement.style.alignmentBaseline = rectextStyle.alignmentBaseline;

            // Set the font color to black in the input element
            inputElement.style.color = 'black';

            foreignObject.appendChild(inputElement);
            selectedNodeElement.appendChild(foreignObject);

            // Hide the original text element while editing
            rectext.style.visibility = 'hidden';

            console.log('handleEdit 1');
            // Apply focus and selection after the input element is rendered
            requestAnimationFrame(() => {
                console.log('handleEdit 2');
                inputElement.focus();
                inputElement.select();
            });

            inputElement.addEventListener('blur', () => {
                console.log('handleEdit 3');

                const newText = inputElement.value;
                rectext.textContent = newText;

                const selectedNodeData = mindMapData.nodes.find((node) => node.id === selectedNodeId);
                if (selectedNodeData) {
                    selectedNodeData.label = newText;
                }

                // Show the original text element after editing is done
                rectext.style.visibility = 'visible';

                selectedNodeElement.removeChild(foreignObject);
            });

            inputElement.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    inputElement.blur(); // Trigger blur event to save the entered text
                }
            });
        }
    }
}


function handleInputSubmit() {
    userInput = document.getElementById('textInput').value;
    sendChatMessage(userInput);
}


function handleInputSave() {

    const fileNameModal = new bootstrap.Modal(document.getElementById('fileNameModal'));
    fileNameModal.show();

    // Get the file name from the input field
    const fileNameInput = document.getElementById('fileNameInput');
    const fileName = fileNameInput.value.trim();
    saveDrawing(fileName);
}


function handleColorPalette(type, id) {
    const colorPalette = document.getElementById("colorPalette");
    showColorPalette(type, id);

}

// Function to generate a random hexadecimal color code
function generateRandomColorCode() {
    const letters = "0123456789ABCDEF";
    let colorCode = "#";
    for (let i = 0; i < 6; i++) {
        colorCode += letters[Math.floor(Math.random() * 16)];
    }
    return colorCode;
}

function showColorPalette(type, id) {
    // Set the clicked box as the active box
    console.log("showColorPalette for id =" + id, 'type =' + type);

    // Show the color palette
    colorPalette.innerHTML = "";

    for (let i = 0; i < 42; i++) {
        const colorCode = generateRandomColorCode();
        const colorPaletteColor = document.createElement("div");
        colorPaletteColor.className = "color-palette-color";
        colorPaletteColor.style.backgroundColor = colorCode;
        colorPaletteColor.addEventListener("click", function() {
            // Hide the color palette
            colorPalette.style.display = "none";

            if (type == 'line') {
                console.log("Changing the Line Color");
                console.log(`Current Line Id ${id}`);
                const lineElement = d3.select(`#${id}`);

                lineElement.style("stroke", colorCode);

                // Update the stroke-width in the mind map data
                const relationship = mindMapData.relationships.find((relation) => {
                    const slineId = `${relation.source}-${relation.target}`;
                    return slineId === id;
                });

                if (relationship) {
                    relationship.stroke = colorCode;
                    console.log('Setting the mindMapData Color');
                }

            } else {
                // Set the selected color as the fill color of the active box
                if (id) {
                    console.log("Change Color - Changing the Node Color id=" + id);
                    const boxElement = d3.select(`#${id} rect`);
                    boxElement.style("fill", colorCode);

                    // Update the color property in the mind map data
                    const nodeData = mindMapData.nodes.find((node) => node.id === id);
                    if (nodeData) {
                        console.log('Updating mindMapData Color for Id =' + id);
                        nodeData.fill = colorCode;
                    }
                }
            }
        });
        colorPalette.appendChild(colorPaletteColor);
    }

    // Calculate the midpoint of the line or box
    if (type === 'line') {
        const lineId = id;
        const lineElement = d3.select(`#${id}`);
        const x1 = parseFloat(lineElement.attr("x1"));
        const y1 = parseFloat(lineElement.attr("y1"));
        const x2 = parseFloat(lineElement.attr("x2"));
        const y2 = parseFloat(lineElement.attr("y2"));
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        // Position the color palette next to the midpoint of the line
        const paletteX = midX - 70; //- colorPalette.offsetWidth / 2;
        const paletteY = midY - 70; //- colorPalette.offsetHeight / 2;

        colorPalette.style.top = paletteY + "px";
        colorPalette.style.left = paletteX + "px";
    } else {
        // Position the color palette on top of the box
        const boxElement = d3.select(`#${id}`);
        console.log("boxElement =" + boxElement.attr('id'))
            // Get the x and y attributes
        const x = parseFloat(boxElement.attr('transform').split(',')[0].split('(')[1]);
        const y = parseFloat(boxElement.attr('transform').split(',')[1].split(')')[0]);

        console.log(x);
        const paletteX = x + rectHeight;
        const paletteY = y - rectHeight;

        colorPalette.style.top = paletteY + "px";
        colorPalette.style.left = paletteX + "px";
    }

    // Show the color palette
    colorPalette.style.display = "block";
}



async function handleOpen() {
    const fileList = await getDrawings();
    console.log("printing the array to populate ...");
    console.log(fileList);
    populateFileList(fileList);

    const modalElement = document.getElementById('fileListModal');
    const modal = new bootstrap.Modal(modalElement);

    const fileListSelect = document.getElementById('fileListSelect');
    let selectedFileName = null;

    fileListSelect.addEventListener('change', () => {
        selectedFileName = fileListSelect.value;
    });

    const selectButton = document.getElementById('selectFileButton');
    const cancelButton = document.querySelector('[data-bs-dismiss="modal"]');

    selectButton.addEventListener('click', () => {
        if (selectedFileName) {
            modal.hide();
            const selectedFile = fileList.find((file) => file.fileName === selectedFileName);
            const selectedJsondrw = selectedFile.jsondrw;
            console.log('Selected jsondrw file', selectedFile.fileName);
            console.log('Selected jsondrw:', selectedJsondrw);
            const selectedFileNameElement = document.getElementById('selectedFileName');
            selectedFileNameElement.textContent = selectedFileName;
            mindMapData = selectedJsondrw
            renderMindMap();

        } else {
            alert('Please select a file.'); // Show an alert to prompt the user to select a file
        }
    });

    cancelButton.addEventListener('click', () => {
        selectedFileName = null;
        modal.hide();
    });

    modal.show();
}


async function getsessionid() {
    try {
        const response = await fetch('http://localhost:3000/api/getsession', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const responseData = await response.json();
            const { sessionID } = responseData;

            console.log('Session ID received:', sessionID);

        } else {
            console.error('Error getting session:', response.status);
        }
    } catch (error) {
        console.error('Error getting session:', error);
    }
}


async function sendChatMessage(message) {
    try {
        const response = await fetch('http://localhost:3000/api/sendprompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: message
            })
        });

        if (response.ok) {
            const responseData = await response.json();
            const {
                mindMapDataJson
            } = responseData;

            console.log('Received mind map data:', mindMapDataJson);
            //jsondrw = mindMapDataJson;

            mindMapData = calculateNodePositions(mindMapDataJson)
            console.log('Adjusted mind map data with positions:', mindMapData);

            renderMindMap();
        } else {
            console.error('Error sending chat message:', response.status);
        }
    } catch (error) {
        console.error('Error sending chat message:', error);
    }
}


async function saveDrawing() {
    // Get the file name from the input field
    const fileNameInput = document.getElementById('fileNameInput');
    const fileName = fileNameInput.value.trim();

    // Check if the user provided a file name
    if (fileName !== "") {
        console.log("Handle saving with file name:", fileName);

        // Remove the modal from the DOM
        const fileNameModal = bootstrap.Modal.getInstance(document.getElementById('fileNameModal'));
        fileNameModal.hide();
        document.body.removeChild(document.getElementById('fileNameModal'));

        // Proceed with saving using the file name
        try {
            const response = await fetch('http://localhost:3000/api/savedraw', {
                method: 'POST',
                body: JSON.stringify({
                    fileName: fileName,
                    jsondrw: mindMapData
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Drawing saved successfully');
                // Perform any necessary UI updates or redirects after successful saving
            } else {
                console.error('Failed to save drawing');
                // Handle the error and provide appropriate user feedback
            }
        } catch (error) {
            console.error('An error occurred:', error);
            // Handle the error and provide appropriate user feedback
        }
    } else {
        console.log("File name not provided. Saving canceled.");
    }
}


async function getDrawings() {
    try {
        console.log('getDrawings fron server ......');

        const response = await fetch('http://localhost:3000/api/getdraw', {
            method: 'GET'
        });

        if (response.ok) {
            const drawings = await response.json();
            console.log('Drawings received:', drawings);
            return drawings;

        } else {
            console.error('Error getting drawings:', response.status);
            return response.statusText;
        }
    } catch (error) {
        console.error('Error getting drawingss:', error);
        return response.error.text;
    }
}


// Function to populate the file list select options
function populateFileList(fileList) {
    const fileListSelect = document.getElementById('fileListSelect');

    fileList.forEach((file) => {
        const option = document.createElement('option');
        option.value = file.fileName;
        option.text = file.fileName;
        fileListSelect.appendChild(option);
    });
}

function calculateNodePositions(response) {
    const nodes = response.nodes;
    const relationships = response.relationships;

    const nodePositions = new Map(); // Map to store the calculated positions

    const nodeOrder = []; // Array to keep track of the node order

    // Sort nodes based on the order of source nodes appearing first
    nodes.sort((a, b) => {
        const aIsSource = relationships.some((relationship) => relationship.source === a.id);
        const bIsSource = relationships.some((relationship) => relationship.source === b.id);

        if (aIsSource && !bIsSource) {
            return -1;
        } else if (!aIsSource && bIsSource) {
            return 1;
        } else {
            return 0;
        }
    });

    // Calculate x and y positions for each node
    nodes.forEach((node, index) => {
        const rectWidth = node.label.length * 10 + 20; // Adjust the box width based on the text length
        const rectHeight = 50;

        const paddingX = 100; // Horizontal padding between nodes
        const paddingY = 100; // Vertical padding between nodes

        const row = Math.floor(index / 3); // Number of rows (adjust the value to control the layout)

        const x = (index % 3) * (rectWidth + paddingX); // Calculate x position
        const y = row * (rectHeight + paddingY); // Calculate y position

        node.x = x; // Set x position
        node.y = y; // Set y position

        nodePositions.set(node.id, { x, y }); // Store the calculated position

        nodeOrder.push(node.id); // Add node to the node order array
    });

    // Sort the nodes based on the node order
    nodes.sort((a, b) => nodeOrder.indexOf(a.id) - nodeOrder.indexOf(b.id));

    // Update the relationships with the calculated positions
    relationships.forEach((relationship) => {
        const sourcePosition = nodePositions.get(relationship.source);
        const targetPosition = nodePositions.get(relationship.target);

        relationship.x1 = sourcePosition.x; // Set x position for the relationship source
        relationship.y1 = sourcePosition.y; // Set y position for the relationship source
        relationship.x2 = targetPosition.x; // Set x position for the relationship target
        relationship.y2 = targetPosition.y; // Set y position for the relationship target
    });

    return response;
}