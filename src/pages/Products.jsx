import { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { products, categories } from "@/data/products";

export default function Products() {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const getProductStats = (product) => [
    { label: "Sales", value: product.sales, trend: "up" },
    { label: "Out Stock Products", value: product.outOfStock, trend: "warning" },
    { label: "Remaining Products", value: product.remaining, trend: "warning" }
  ];

  // Filter products by category
  const filteredProducts = activeCategory === 'ALL'
    ? products
    : products.filter(product =>
        product.category.toLowerCase() === activeCategory.toLowerCase()
      );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4 mb-2">
        <h1 className="text-2xl font-bold mb-6 text-green-700">All Products</h1>
        <Button className="bg-primary" style={{ backgroundColor: '#007539', borderColor: '#007539' }} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          ADD NEW PRODUCT
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-5 py-2 whitespace-nowrap transition-all duration-150 ${activeCategory === category ? '' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-100'}`}
            style={activeCategory === category ? { backgroundColor: '#007539', borderColor: '#007539', color: 'white' } : {}}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-transform duration-200 hover:-translate-y-1 flex flex-col">
            <div className="relative flex flex-col items-center p-4 pb-0">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-[200px] h-[200px] object-cover mx-auto rounded-xl border"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {product.status === 'out_of_stock' && (
                <Badge className="absolute top-4 left-4 bg-red-100 text-red-700 border border-red-300">Out of Stock</Badge>
              )}
              {product.status === 'low_stock' && (
                <Badge className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 border border-yellow-300">Low Stock</Badge>
              )}
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg mb-1 truncate" title={product.name}>{product.name}</h3>
                  <Badge variant="secondary" className="mt-1">{product.category}</Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{product.price}</p>
                </div>
              </div>
              <div className="space-y-3 mt-4 flex-1">
                <div>
                  <h4 className="font-medium text-sm mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  <button className="text-primary text-sm hover:underline mt-1 focus:outline-none">
                    Readmore...
                  </button>
                </div>
                <div className="space-y-2">
                  {getProductStats(product).map((stat, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">↗</span>
                        <span className="font-medium">{stat.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}