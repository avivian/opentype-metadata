const fs = require("fs").promises;

const opentype = require("opentype.js");

function getNames(openType) {
  const { names } = openType;
  const output = {};
  for (const [key, value] of Object.entries(names)) {
    if (!isNaN(key)) {
      continue;
    }
    output[key] = value.en;
  }
  return output;
}

function getVariableData(openType) {
  const { tables } = openType;
  if (tables?.fvar === undefined) {
    return null;
  }

  const axes = tables.fvar.axes.map((a) => ({
    ...a,
    name: a.name["en"],
  }));

  const instances = tables.fvar.instances.map((a) => ({
    ...a,
    name: a.name["en"],
  }));

  return { axes, instances };
}

async function parseFont({ buffer }) {
  const arrayBuffer = new Uint8Array(buffer).buffer;
  const font = await opentype.parse(arrayBuffer);

  const names = getNames(font);
  const variable = getVariableData(font);

  return {
    ...names,
    ...(variable && { variable }),
  };
}

async function main() {
  if (process.argv.length != 3) {
    console.error(".ttf/.otf file required!");
    console.error("Usage: ./app.js FONT-FILE");
    process.exit(1);
  }

  const filepath = process.argv[2];
  const buffer = await fs.readFile(filepath);

  const metadata = await parseFont({ buffer });
  console.log(metadata);
}

main();
