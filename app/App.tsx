"use client";

import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { getProducts } from '../lib/fetchProducts';

import { useMutation, useRedo, useStorage, useUndo } from "@/liveblocks.config";
import {
  handleCanvaseMouseMove,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectMoving,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleCanvasZoom,
  handlePathCreated,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "@/lib/canvas";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { LeftSidebar, Live, Navbar, RightSidebar } from "@/components/index";
import { handleImageUpload } from "@/lib/shapes";
import { defaultNavElement } from "@/constants";
import { ActiveElement, Attributes } from "@/types/type";
type CartItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
};
const Home = () => {
  const undo = useUndo();
  const redo = useRedo();
  const [products, setProducts] = useState<any[]>([]); // New state for products
  const [cart, setCart] = useState<CartItem[]>([]); // Cart state


  const canvasObjects = useStorage((root) => root.canvasObjects);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const isDrawing = useRef(false);

  const shapeRef = useRef<fabric.Object | null>(null);

  const selectedShapeRef = useRef<string | null>(null);

  const activeObjectRef = useRef<fabric.Object | null>(null);
  const isEditingRef = useRef(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: "",
    height: "",
    fontSize: "",
    fontFamily: "",
    fontWeight: "",
    fill: "#aabbcc",
    stroke: "#aabbcc",
  });

  const deleteShapeFromStorage = useMutation(({ storage }, shapeId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(shapeId);
  }, []);

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");

    if (!canvasObjects || canvasObjects.size === 0) return true;

    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }

    return canvasObjects.size === 0;
  }, []);

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;

    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");

    canvasObjects.set(objectId, shapeData);
  }, []);

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      case "reset":
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;

      case "delete":
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;

      case "image":
        imageInputRef.current?.click();

        isDrawing.current = false;

        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = false;
        }
        break;

      case "comments":
        break;

      default:
        selectedShapeRef.current = elem?.value as string;
        break;
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data); // Store the fetched products
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  // Update cart in localStorage whenever the cart changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Add item to cart
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      // Check if the product is already in the cart
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // If product exists, increase quantity
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Otherwise, add the new product to the cart
        return [
          ...prevCart,
          { id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 },
        ];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Update item quantity in the cart
  const updateQuantity = (id: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: quantity } : item
      )
    );
  };







  useEffect(() => {
    const canvas = initializeFabric({
      canvasRef,
      fabricRef,
    });

    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        shapeRef,
      });
    });

    canvas.on("mouse:move", (options) => {
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        selectedShapeRef,
        shapeRef,
        syncShapeInStorage,
      });
    });

    canvas.on("mouse:up", () => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        activeObjectRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
      });
    });

    canvas.on("path:created", (options) => {
      handlePathCreated({
        options,
        syncShapeInStorage,
      });
    });

    canvas.on("object:modified", (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });

    canvas?.on("object:moving", (options) => {
      handleCanvasObjectMoving({
        options,
      });
    });

    canvas.on("selection:created", (options) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on("object:scaling", (options) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
      });
    });

    canvas.on("mouse:wheel", (options) => {
      handleCanvasZoom({
        options,
        canvas,
      });
    });

    window.addEventListener("resize", () => {
      handleResize({
        canvas: fabricRef.current,
      });
    });

    window.addEventListener("keydown", (e) =>
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      })
    );

    return () => {
      canvas.dispose();

      window.removeEventListener("resize", () => {
        handleResize({
          canvas: null,
        });
      });

      window.removeEventListener("keydown", (e) =>
        handleKeyDown({
          e,
          canvas: fabricRef.current,
          undo,
          redo,
          syncShapeInStorage,
          deleteShapeFromStorage,
        })
      );
    };
  }, [canvasRef]);

  useEffect(() => {
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef,
    });
  }, [canvasObjects]);

  return (
    <main className="h-screen overflow-hidden bg-gray-50 min-h-screen">
      <Navbar
        imageInputRef={imageInputRef}
        activeElement={activeElement}
        handleImageUpload={(e: any) => {
          e.stopPropagation();
          handleImageUpload({
            file: e.target.files[0],
            canvas: fabricRef as any,
            shapeRef,
            syncShapeInStorage,
          });
        }}
        handleActiveElement={handleActiveElement}
      />
  
      <section className="flex h-full flex-row gap-4 p-4">
        {/* Left Sidebar */}
        <LeftSidebar allShapes={Array.from(canvasObjects)} />
  
        {/* Product List */}
        <div className="w-1/4 bg-white p-4 rounded-lg shadow-lg transition-transform hover:scale-105">
          <h2 className="font-bold text-xl mb-4">Products</h2>
          <ul className="space-y-4">
            {products.length === 0 ? (
              <li>Loading products...</li>
            ) : (
              products.map((product) => (
                <li key={product.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex flex-col items-center space-y-2">
                    <img src={product.image} alt={product.title} className="w-24 h-24 object-cover rounded-md shadow-md transition-transform hover:scale-110" />
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">{product.title}</h3>
                      <p className="text-gray-600">${product.price}</p>
                    </div>
                    <button
                      className="mt-2 bg-blue-500 text-white py-1 px-4 rounded-md shadow-md transition-transform hover:scale-105 hover:bg-blue-600"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
  
        {/* Shopping Cart */}
        <div className="w-1/4 bg-white p-4 rounded-lg shadow-lg">
          <h2 className="font-bold text-xl mb-4">Shopping Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-center space-x-4">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-md shadow-md" />
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-gray-600">${item.price}</p>
                    </div>
                  </div>
  
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-yellow-500 text-white py-1 px-2 rounded-md shadow-md transition-transform hover:scale-105"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="bg-yellow-500 text-white py-1 px-2 rounded-md shadow-md transition-transform hover:scale-105"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <button
                      className="bg-red-500 text-white py-1 px-2 rounded-md shadow-md transition-transform hover:scale-105 hover:bg-red-600"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
  
        {/* Canvas/Live Area */}
        <Live canvasRef={canvasRef} undo={undo} redo={redo} />
  
        {/* Right Sidebar */}
        <RightSidebar
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
  
};

export default Home;
