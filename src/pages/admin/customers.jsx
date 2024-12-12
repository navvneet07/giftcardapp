import React, { useState, useEffect } from 'react';
import { FiSearch, FiMail, FiPhone, FiShoppingBag } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, [page, searchTerm]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `/api/admin/customers?page=${page}&search=${searchTerm}`
      );
      const data = await response.json();
      setCustomers(data.customers);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Customers</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div
              key={customer._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-purple-600">
                    {customer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Customer since {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <FiMail className="w-4 h-4 mr-2" />
                  {customer.email}
                </div>
                {customer.phone && (
                  <div className="flex items-center text-sm text-gray-500">
                    <FiPhone className="w-4 h-4 mr-2" />
                    {customer.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <FiShoppingBag className="w-4 h-4 mr-2" />
                  {customer.orderCount} orders
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Spent</span>
                  <span className="font-medium">₹{customer.totalSpent.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index + 1)}
              className={`px-4 py-2 rounded-lg ${
                page === index + 1
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </AdminLayout>
  );
};

const CustomerDetailsModal = ({ customer, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const fetchCustomerOrders = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${customer._id}/orders`);
      const data = await response.json();
      setOrders(data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{customer.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{customer.email}</p>
            </div>
            {customer.phone && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{customer.phone}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
              <p className="mt-1">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Order History
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Order ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                      Total
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-2 text-sm">#{order._id.slice(-6)}</td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        ₹{order.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
