#!/usr/bin/env node
/**
 * Component Map Tool
 * Analyzes component usage across pages and generates bidirectional mapping
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComponentUsage {
  component: string;
  filePath: string;
  routes: string[];
  usageCount: number;
}

interface RouteComponents {
  route: string;
  components: string[];
}

interface ComponentMap {
  components: { [key: string]: string[] }; // component -> routes[]
  routes: { [key: string]: string[] };      // route -> components[]
  statistics: {
    totalComponents: number;
    totalRoutes: number;
    averageComponentsPerRoute: number;
    mostUsedComponents: Array<{ component: string; count: number }>;
  };
}

const PAGES_DIR = path.join(process.cwd(), 'client', 'src', 'pages');
const COMPONENTS_DIR = path.join(process.cwd(), 'client', 'src', 'components');
const APP_TSX = path.join(process.cwd(), 'client', 'src', 'App.tsx');
const DOCS_DIR = path.join(process.cwd(), 'docs');

// Ensure docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

/**
 * Parse routes from App.tsx
 */
function parseRoutes(): Map<string, string> {
  const routes = new Map<string, string>();
  
  if (!fs.existsSync(APP_TSX)) {
    return routes;
  }

  const content = fs.readFileSync(APP_TSX, 'utf-8');
  const routeRegex = /<Route\s+path="([^"]+)"\s+component=\{(\w+)\}\s*\/>/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    routes.set(match[2], match[1]); // component -> route
  }
  
  return routes;
}

/**
 * Find all components in components directory
 */
function findComponents(): Set<string> {
  const components = new Set<string>();
  
  function scanDir(dir: string): void {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        // Extract component names from exports
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Match: export function ComponentName
        const functionExports = content.matchAll(/export\s+(?:function|const)\s+(\w+)/g);
        for (const match of functionExports) {
          components.add(match[1]);
        }
        
        // Match: export default function ComponentName
        const defaultExports = content.matchAll(/export\s+default\s+function\s+(\w+)/g);
        for (const match of defaultExports) {
          components.add(match[1]);
        }
      }
    }
  }
  
  scanDir(COMPONENTS_DIR);
  return components;
}

/**
 * Extract component imports from a file
 * Handles: named imports, default imports, aliased imports, barrel exports, JSX usage
 */
function extractImports(filePath: string, availableComponents: Set<string>): string[] {
  const imports: string[] = [];
  
  if (!fs.existsSync(filePath)) {
    return imports;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Track aliased imports: import { Button as Btn } from ...
  const aliasMap = new Map<string, string>();
  
  // Match: import { Component1, Component2 as Alias2 } from ...
  const namedImports = content.matchAll(/import\s+\{([^}]+)\}\s+from/g);
  for (const match of namedImports) {
    const importList = match[1];
    const parts = importList.split(',').map(p => p.trim());
    
    for (const part of parts) {
      // Handle aliased imports: "Component as Alias"
      const aliasMatch = part.match(/^(\w+)\s+as\s+(\w+)$/);
      if (aliasMatch) {
        const [, originalName, aliasName] = aliasMatch;
        if (availableComponents.has(originalName)) {
          imports.push(originalName);
          aliasMap.set(aliasName, originalName);
        }
      } else {
        // Regular import: "Component"
        if (availableComponents.has(part)) {
          imports.push(part);
        }
      }
    }
  }
  
  // Match: import Component from ...
  const defaultImports = content.matchAll(/import\s+(\w+)\s+from/g);
  for (const match of defaultImports) {
    const component = match[1];
    if (availableComponents.has(component)) {
      imports.push(component);
    }
  }
  
  // Check JSX usage (e.g., <Button />, <Btn />) including aliased components
  const jsxUsage = content.matchAll(/<(\w+)[\s/>\.]/g);
  for (const match of jsxUsage) {
    const tagName = match[1];
    
    // Check if it's a known component
    if (availableComponents.has(tagName) && !imports.includes(tagName)) {
      imports.push(tagName);
    }
    
    // Check if it's an alias
    const originalName = aliasMap.get(tagName);
    if (originalName && !imports.includes(originalName)) {
      imports.push(originalName);
    }
  }
  
  return [...new Set(imports)]; // Deduplicate
}

/**
 * Resolve barrel exports (index.ts files that re-export components)
 */
function resolveBarrelExports(componentsDir: string): Map<string, string> {
  const barrelMap = new Map<string, string>();
  
  function scanForBarrels(dir: string): void {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanForBarrels(fullPath);
      } else if (entry.name === 'index.ts' || entry.name === 'index.tsx') {
        // Parse barrel file for re-exports
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Match: export { Component } from './component'
        // Also handle: export { default as Component } from './component'
        const reExports = content.matchAll(/export\s+\{([^}]+)\}\s+from/g);
        for (const match of reExports) {
          const exportList = match[1];
          const parts = exportList.split(',').map(p => p.trim());
          
          parts.forEach(part => {
            // Handle "default as ComponentName"
            const aliasMatch = part.match(/^default\s+as\s+(\w+)$/);
            if (aliasMatch) {
              const aliasName = aliasMatch[1];
              barrelMap.set(aliasName, fullPath);
            } else {
              // Regular export: "ComponentName" or "ComponentName as Alias"
              const regularMatch = part.match(/^(\w+)(?:\s+as\s+(\w+))?$/);
              if (regularMatch) {
                const originalName = regularMatch[1];
                const aliasName = regularMatch[2] || originalName;
                barrelMap.set(aliasName, fullPath);
                // Also map original name if different
                if (aliasName !== originalName) {
                  barrelMap.set(originalName, fullPath);
                }
              }
            }
          });
        }
        
        // Match: export * from './component'
        const starExports = content.matchAll(/export\s+\*\s+from\s+['"](.*)['"]/g);
        for (const match of starExports) {
          const targetPath = match[1];
          const resolvedPath = path.resolve(path.dirname(fullPath), targetPath);
          
          if (fs.existsSync(resolvedPath + '.ts') || fs.existsSync(resolvedPath + '.tsx')) {
            const targetContent = fs.readFileSync(
              fs.existsSync(resolvedPath + '.ts') ? resolvedPath + '.ts' : resolvedPath + '.tsx',
              'utf-8'
            );
            
            // Extract exported names
            const exportMatches = targetContent.matchAll(/export\s+(?:function|const)\s+(\w+)/g);
            for (const exportMatch of exportMatches) {
              barrelMap.set(exportMatch[1], fullPath);
            }
          }
        }
      }
    }
  }
  
  scanForBarrels(componentsDir);
  return barrelMap;
}

/**
 * Analyze component usage across all pages
 */
function analyzeComponentUsage(): ComponentMap {
  const routes = parseRoutes();
  const components = findComponents();
  const barrelExports = resolveBarrelExports(COMPONENTS_DIR);
  
  console.log(`📦 Found ${barrelExports.size} barrel-exported components`);
  
  const componentToRoutes: { [key: string]: string[] } = {};
  const routeToComponents: { [key: string]: string[] } = {};
  
  // Initialize component map
  components.forEach(comp => {
    componentToRoutes[comp] = [];
  });
  
  // Scan all pages
  function scanPages(dir: string, prefix = ''): void {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanPages(fullPath, `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith('.tsx')) {
        // Determine route path
        const componentName = entry.name.replace('.tsx', '');
        const pascalName = componentName
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');
        
        let routePath = routes.get(pascalName) || 
                       routes.get(componentName) ||
                       routes.get(componentName.charAt(0).toUpperCase() + componentName.slice(1));
        
        if (!routePath) {
          const relPath = prefix + entry.name.replace('.tsx', '');
          routePath = `/${relPath}`;
        }
        
        // Extract imports (with barrel export awareness)
        const usedComponents = extractImports(fullPath, components);
        
        // Also check for components imported via barrel exports
        // Example: import { Button } from '@/components/ui'
        // where ui/index.ts exports Button from './button'
        const barrelImported = new Set<string>();
        barrelExports.forEach((barrelPath, componentName) => {
          if (components.has(componentName)) {
            // Check if this page imports from the barrel
            const content = fs.readFileSync(fullPath, 'utf-8');
            const barrelDir = path.dirname(barrelPath);
            const barrelDirName = path.basename(barrelDir);
            
            // Match imports from barrel directory
            const barrelImportRegex = new RegExp(`from\\s+['"].*/${barrelDirName}['"]`, 'g');
            if (barrelImportRegex.test(content) && !usedComponents.includes(componentName)) {
              // Component might be imported via barrel
              const namedImportRegex = new RegExp(`import\\s+\\{[^}]*\\b${componentName}\\b[^}]*\\}\\s+from\\s+['"].*/${barrelDirName}['"]`);
              if (namedImportRegex.test(content)) {
                barrelImported.add(componentName);
              }
            }
          }
        });
        
        // Merge barrel-imported components
        const allUsedComponents = [...usedComponents, ...Array.from(barrelImported)];
        
        // Update mappings
        routeToComponents[routePath] = allUsedComponents;
        
        allUsedComponents.forEach(comp => {
          if (!componentToRoutes[comp]) {
            componentToRoutes[comp] = [];
          }
          componentToRoutes[comp].push(routePath);
        });
      }
    }
  }
  
  scanPages(PAGES_DIR);
  
  // Calculate statistics
  const routeCount = Object.keys(routeToComponents).length;
  const componentCount = Object.keys(componentToRoutes).filter(k => componentToRoutes[k].length > 0).length;
  
  const totalComponentUsages = Object.values(routeToComponents).reduce(
    (sum, comps) => sum + comps.length,
    0
  );
  const avgComponentsPerRoute = routeCount > 0 ? totalComponentUsages / routeCount : 0;
  
  const mostUsed = Object.entries(componentToRoutes)
    .map(([component, routes]) => ({
      component,
      count: routes.length,
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    components: componentToRoutes,
    routes: routeToComponents,
    statistics: {
      totalComponents: componentCount,
      totalRoutes: routeCount,
      averageComponentsPerRoute: Math.round(avgComponentsPerRoute * 10) / 10,
      mostUsedComponents: mostUsed,
    },
  };
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(map: ComponentMap): string {
  let md = `# Component Usage Map\n\n`;
  md += `**Generated**: ${new Date().toISOString()}\n\n`;
  md += `---\n\n`;
  
  // Statistics
  md += `## 📊 Statistics\n\n`;
  md += `- **Total Components**: ${map.statistics.totalComponents}\n`;
  md += `- **Total Routes**: ${map.statistics.totalRoutes}\n`;
  md += `- **Average Components per Route**: ${map.statistics.averageComponentsPerRoute}\n\n`;
  
  // Top 10 most used components
  md += `## 🏆 Top 10 Most Used Components\n\n`;
  md += `| Rank | Component | Usage Count | Routes |\n`;
  md += `|------|-----------|-------------|--------|\n`;
  
  map.statistics.mostUsedComponents.forEach((item, index) => {
    const routes = map.components[item.component] || [];
    const routeList = routes.slice(0, 3).join(', ') + (routes.length > 3 ? `, ... (+${routes.length - 3})` : '');
    md += `| ${index + 1} | \`${item.component}\` | ${item.count} | ${routeList} |\n`;
  });
  
  md += `\n`;
  
  // Component → Routes mapping
  md += `## 🔗 Component → Routes Mapping\n\n`;
  
  const sortedComponents = Object.entries(map.components)
    .filter(([_, routes]) => routes.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  
  sortedComponents.forEach(([component, routes]) => {
    md += `### \`${component}\`\n\n`;
    if (routes.length === 0) {
      md += `- *Not used in any routes*\n\n`;
    } else {
      routes.forEach(route => {
        md += `- ${route}\n`;
      });
      md += `\n`;
    }
  });
  
  // Routes → Components mapping
  md += `## 📄 Routes → Components Mapping\n\n`;
  
  const sortedRoutes = Object.entries(map.routes)
    .sort(([a], [b]) => a.localeCompare(b));
  
  sortedRoutes.forEach(([route, components]) => {
    md += `### ${route}\n\n`;
    if (components.length === 0) {
      md += `- *No components used*\n\n`;
    } else {
      md += `**Components** (${components.length}):\n`;
      components.forEach(comp => {
        md += `- \`${comp}\`\n`;
      });
      md += `\n`;
    }
  });
  
  return md;
}

/**
 * Main execution
 */
function main() {
  console.log('🗺️  Component Map Tool\n');
  
  console.log(`📂 Scanning components: ${COMPONENTS_DIR}`);
  console.log(`📂 Scanning pages: ${PAGES_DIR}\n`);
  
  const map = analyzeComponentUsage();
  
  console.log(`✅ Analysis complete\n`);
  console.log(`📊 Statistics:`);
  console.log(`   - Components found: ${map.statistics.totalComponents}`);
  console.log(`   - Routes analyzed: ${map.statistics.totalRoutes}`);
  console.log(`   - Avg components/route: ${map.statistics.averageComponentsPerRoute}`);
  
  // Write JSON
  const jsonPath = path.join(DOCS_DIR, 'component_map.json');
  fs.writeFileSync(jsonPath, JSON.stringify(map, null, 2), 'utf-8');
  console.log(`\n📄 Wrote: ${jsonPath}`);
  
  // Write Markdown
  const markdown = generateMarkdownReport(map);
  const mdPath = path.join(DOCS_DIR, 'component_map.md');
  fs.writeFileSync(mdPath, markdown, 'utf-8');
  console.log(`📄 Wrote: ${mdPath}`);
  
  // Show top 5
  console.log(`\n🏆 Top 5 Components:`);
  map.statistics.mostUsedComponents.slice(0, 5).forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.component} (${item.count} routes)`);
  });
  
  console.log(`\n✨ Done!`);
}

// Execute
try {
  main();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
