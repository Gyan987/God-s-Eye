import { useState } from 'react';
import { useForm } from 'react-hook-form';
import client from '../api/client';

const ReportFoundPage = () => {
  const { register, handleSubmit, reset } = useForm();
  const [feedback, setFeedback] = useState('');

  const onSubmit = async (values) => {
    setFeedback('');
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'image' && value?.[0]) formData.append('image', value[0]);
      else formData.append(key, value || '');
    });

    try {
      const { data } = await client.post('/found-items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFeedback(data.message);
      reset();
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Failed to report found item.');
    }
  };

  return (
    <section className="glass mx-auto max-w-3xl rounded-3xl p-6 md:p-8">
      <h1 className="mb-6 text-2xl font-extrabold">Report Found Item</h1>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Item Name</label>
          <input {...register('item_name', { required: true })} />
        </div>
        <div>
          <label>Category</label>
          <select {...register('category', { required: true })}>
            <option value="phone">Phone</option>
            <option value="wallet">Wallet</option>
            <option value="bag">Bag</option>
            <option value="documents">Documents</option>
            <option value="keys">Keys</option>
            <option value="pets">Pets</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label>Description</label>
          <textarea rows="4" {...register('description', { required: true })} />
        </div>
        <div>
          <label>Location Found</label>
          <input {...register('location_found', { required: true })} />
        </div>
        <div>
          <label>Date Found</label>
          <input type="date" {...register('date_found', { required: true })} />
        </div>
        <div>
          <label>Upload Image</label>
          <input type="file" accept="image/*" {...register('image')} />
        </div>
        <div>
          <label>Finder Contact Email</label>
          <input type="email" {...register('finder_contact_email')} />
        </div>
        <div>
          <label>Finder Phone</label>
          <input {...register('finder_phone')} />
        </div>
        <div className="md:col-span-2">
          <button className="w-full rounded-xl bg-ocean px-4 py-3 font-bold text-white" type="submit">
            Report Found Item
          </button>
        </div>
      </form>
      {feedback && <p className="mt-3 text-sm font-semibold">{feedback}</p>}
    </section>
  );
};

export default ReportFoundPage;
